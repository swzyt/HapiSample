'use strict'

const schedule = require("node-schedule");
const _ = require('lodash');
const moment = require("moment");
const restler = require("./restler");
const Bagpipe = require('bagpipe');
const cluster = require('cluster');

/**
 * 最大进程数
 * 根据 PM2 运行本项目的进程数设置
 */
const MaxProcessCount = cluster.worker ? cluster.worker.process.env.instances : 1;

/**Redis KEY 前缀 */
const RedisTaskListKeyPrefix = 'LOCAL-TASK-LIST';

/**Redis Run Limit KEY 前缀 */
const RedisRunLimitKeyPrefix = 'LOCAL-TASK-Run-Limit';

module.exports = function (db) {

    //redis 发布/订阅 客户端
    let pub = db.cache.redis.createClient(db.cache.settings.redis.port, db.cache.settings.redis.host),
        sub = db.cache.redis.createClient(db.cache.settings.redis.port, db.cache.settings.redis.host);

    var TaskMgr = {

        /**Redis 普通订阅 KEY*/
        RedisChannelKey: {
            /**停止全部*/
            STOPALL: `${RedisTaskListKeyPrefix}-StopAll`,
            /**重启单任务*/
            RESTARTSINGLE: `${RedisTaskListKeyPrefix}-ReStartSingle`,
            /**取消单任务*/
            CANCELSINGLE: `${RedisTaskListKeyPrefix}-CancelSingle`,
            /**取消单任务最近一次运行*/
            CANCELNEXTSINGLE: `${RedisTaskListKeyPrefix}-CancelNextSingle`,
            /**同步任务进程表*/
            SYNCTASKPROCESS: `${RedisTaskListKeyPrefix}-SyncTaskProcess`,
        },
        /**Redis 模式订阅 KEY*/
        RedisPatternChannelKey: {
            /**订阅任务ID，模式匹配 */
            PatternTaskChannelID: `${RedisTaskListKeyPrefix}-TaskChannelID-`
        },

        /**任务日志描述*/
        TaskLogType: {
            /**启动任务 */
            STARTLOG: '启动任务',
            /**取消任务 */
            CANCELLOG: '取消任务',
            /**取消最近一次的执行任务 */
            CANCELNEXTLOG: '取消最近一次的执行任务'
        },

        /**数据库连接对象*/
        db,

        /**运行中的任务列表*/
        task_list: {
        },

        /**初始化任务列表至Redis*/
        async initRedis() {
            let self = this;

            //清除队列
            await self.clearRedis();

            // 初始化任务记录
            // await self.db.SystemTask.bulkCreate(initTask);

            //写入新记录
            let tasks = await self.db.SystemTask.findAll({ where: { valid: true, status: 'running' } })
            if (tasks && tasks.length > 0) {
                //添加到redis
                for (let i = 0; i < tasks.length; i++) {
                    await self.pushToRedis(tasks[i])
                }
            }
        },

        /**push至Redis */
        async pushToRedis(item) {
            let self = this;

            let item_str = JSON.stringify(item);

            // 支持任务多进程运行
            // 追加到队列尾部
            let redis_task_key = `${RedisTaskListKeyPrefix}:${item.task_id}`;
            await self.db.cache.client.rpushAsync(redis_task_key, ...Array.from({ length: self.getRunCount(item.process_number) }, (item, index) => { return item_str }));

            //设置任务可运行次数
            let redis_run_limit_key = `${RedisRunLimitKeyPrefix}:${item.task_id}`;
            await self.db.cache.client.rpushAsync(redis_run_limit_key, ...Array.from({ length: item.run_limit }, (item, index) => { return redis_run_limit_key }));
        },

        /**清除Redis任务列表、运行次数限制*/
        async clearRedis() {
            let self = this;

            //清除任务列表
            let keys = await self.db.cache.client.keysAsync(`${RedisTaskListKeyPrefix}*`);
            if (keys && keys.length > 0) {
                for (let i = 0; i < keys.length; i++) {
                    //删除KEY
                    await self.db.cache.client.delAsync(keys[i]);
                }
            }
            //清除任务运行次数限制列表
            keys = await self.db.cache.client.keysAsync(`${RedisRunLimitKeyPrefix}*`);
            if (keys && keys.length > 0) {
                for (let i = 0; i < keys.length; i++) {
                    //删除KEY
                    await self.db.cache.client.delAsync(keys[i]);
                }
            }
        },

        /**从Redis开始任务*/
        async startFromRedis() {
            let self = this;

            await self.initRedis();

            let keys = await self.db.cache.client.keysAsync(`${RedisTaskListKeyPrefix}*`);

            if (keys && keys.length > 0) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];

                    let channel = `${self.RedisPatternChannelKey.PatternTaskChannelID}${key.split(':')[1]}`;

                    //通知各进程运行任务
                    self.pubRedisChannel(channel, key);
                }
            }
        },

        /**获取任务运行最大进程数 */
        getRunCount: function (number) {
            number = number || 1;
            return number > MaxProcessCount ? MaxProcessCount : number;
        },

        /**
         * 检测任务在当前进程是否存在
         * @param {*} task_id 
         */
        checkTaskList(task_id) {
            let result = task_id && this.task_list[task_id];

            console.log(`任务 ${task_id} 在当前进程 ${process.pid} 中 ${result ? '已存在' : '不存在'}`)

            return result;
        },

        /**
         * 检测任务有效性
         * @param {*} item 
         */
        checkTaskItemValid(item) {
            let result = item &&
                item.valid &&
                item.status == "running" &&
                item.path &&
                item.cron &&
                item.parallel_number &&
                item.process_number &&
                item.run_limit &&
                (!item.start_time || moment().isAfter(moment(item.start_time))) &&
                (!item.end_time || moment().isBefore(moment(item.end_time)))

            console.log(`任务 ${item.task_id} 在当前进程 ${process.pid} 中 ${result ? '可运行' : '不可运行'}`)

            return result;
        },

        /**启动任务*/
        Start: async function (channel) {
            let self = this;

            //从redis 队列头部取出待执行的任务
            let redisItem = await self.db.cache.client.lpopAsync(channel);

            if (redisItem) {
                let item = JSON.parse(redisItem)

                //任务未在当前进程运行，且任务配置有效，则运行
                if (!self.checkTaskList(item.task_id) && self.checkTaskItemValid(item)) {
                    await self.Run(item)
                }
            }
        },

        /**停止全部*/
        stopAll: async function () {
            let self = this;

            //清除队列
            await self.clearRedis();

            Object.keys(self.task_list).map(task_id => {
                //遍历当前进程运行的任务，并全部取消
                self.Cancel(task_id);
            })

            return Promise.resolve(true);
        },

        /**
         * 运行任务
         * @param {*} item 
         */
        Run: async function (item) {
            let self = this;

            try {
                //是否正在本进程运行
                if (self.checkTaskList(item.task_id)) {
                    return null;
                }

                //检测任务有效性
                if (!self.checkTaskItemValid(item)) {
                    return null;
                }

                if (item.type == "local" || item.type == "remote") {
                    //任务执行计划
                    let job_rule = { rule: item.cron };

                    if (item.start_time) {
                        job_rule.start = item.start_time;
                    }
                    if (item.end_time) {
                        job_rule.end = item.end_time;
                    }

                    let job = schedule.scheduleJob(item.task_id, job_rule, async function () {

                        const t = async function () {
                            //判断任务执行次数，若超过限制，则取消任务，为0则不限制
                            let redis_run_limit_key = `${RedisRunLimitKeyPrefix}:${item.task_id}`;
                            let run_limit_result = await self.db.cache.client.lpopAsync(redis_run_limit_key);
                            if (item.run_limit > 0 && !run_limit_result) {
                                //发布取消消息
                                self.pubRedisChannel(self.RedisChannelKey.CANCELSINGLE, item.task_id);
                            }
                            else {
                                //运行日志
                                let task_log = self.getLogItem(item.task_id, job);

                                try {
                                    // let fun = require("D:/WorkSpace/Framework/HapiSimple/tasks/index.js")
                                    //本地任务
                                    if (item.type == "local") {
                                        let fun = require(item.path);
                                        if (_.isFunction(fun))
                                            task_log.content = JSON.stringify(await fun());
                                        else
                                            task_log.content = "当前任务非可执行函数";
                                    }
                                    //远程任务
                                    else if (item.type == "remote") {
                                        task_log.content = await restler[item.method](item.path, JSON.parse(item.params));
                                    }
                                }
                                catch (err) {
                                    //异常日志
                                    task_log.content = JSON.stringify({
                                        code: err.code,
                                        message: err.message,
                                        stack: err.stack
                                    })
                                }


                                task_log.content = `日志类型：运行日志\n日志内容：${task_log.content || ''}`;

                                task_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

                                await self.saveLog(task_log)

                                //本次任务执行完毕，执行下一次计划
                                self.task_list[item.task_id] && self.task_list[item.task_id].queue && self.task_list[item.task_id].queue._next();
                            }

                        }

                        //推入任务待执行队列，控制并行数
                        self.task_list[item.task_id] && self.task_list[item.task_id].queue && self.task_list[item.task_id].queue.push(t)

                    });

                    //初始化当前任务执行队列，可控制并行数
                    let queue = new Bagpipe(item.parallel_number || 1)
                    queue.on('full', function (length) {
                        console.warn(`任务 ${item.task_id} 待执行队列长度为: ${length}`);
                    });

                    //保存任务对象
                    self.task_list[item.task_id] = { job: job, queue: queue };
                }
                else if (item.type == "process") {

                    let pro = require(item.path);

                    //启动任务
                    pro && pro.start && pro.start();

                    //保存任务对象
                    self.task_list[item.task_id] = { process: [pro] };
                }

                //启动任务日志
                await self.saveNormalLog(item.task_id, self.TaskLogType.STARTLOG);

                return null;
            }
            catch (err) {
                console.log(err)
                return err
            }
        },

        /**
         * 重启任务
         * @param {*} item
         */
        ReStart: async function (item) {
            if (this.checkTaskList(item.task_id)) {
                //先取消
                await this.Cancel(item.task_id);

                //再运行
                return await this.Run(item);
            }

            return null;
        },

        /**
         * 取消任务
         * 所有的计划调用将会被取消。当你设置 reschedule 参数为true，然后任务将在之后重新排列。
         * @param {*} task_id 
         */
        Cancel: async function (task_id, reschedule = false) {
            if (this.checkTaskList(task_id)) {
                //本地任务或远程任务
                if (this.task_list[task_id] && this.task_list[task_id].job) {
                    this.task_list[task_id].job.cancel(reschedule);
                }
                //本次进程任务
                else if (this.task_list[task_id] && this.task_list[task_id].process) {
                    this.task_list[task_id].process.map(item => {
                        item.exit && item.exit();
                    })
                }
                delete this.task_list[task_id]

                //取消日志
                return await this.saveNormalLog(task_id, this.TaskLogType.CANCELLOG);
            }
            return null;
        },

        /**
         * 取消最近一次的执行任务
         * 这个方法将能将能取消下一个计划的调度或者任务. 当你设置 reschedule 参数为true，然后任务将在之后重新排列。
         * @param {*} task_id 
         */
        CancelNext: async function (task_id, reschedule = false) {
            if (this.checkTaskList(task_id)) {

                if (this.task_list[task_id] && this.task_list[task_id].job) {
                    this.task_list[task_id].job.cancelNext(reschedule);

                    //取消最近一次的执行任务日志
                    return await this.saveNormalLog(task_id, this.TaskLogType.CANCELNEXTLOG);
                }

            }
            return null;
        },

        /**
         * 实例化日志对象
         * @param {*} task_id 
         * @param {*} job 
         */
        getLogItem: function (task_id, job) {
            return {
                task_id,
                start_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                next_time: job && job.nextInvocation() ? moment(job.nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss") : null
            }
        },

        /**
         * 任务操作日志，创建，重启，停止等
         * @param {*} task_id 
         * @param {*} content 
         */
        saveNormalLog(task_id, content) {
            let log_item = this.getLogItem(task_id, this.task_list[task_id] ? this.task_list[task_id].job : null);

            log_item.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

            log_item.content = `日志类型：启停日志\n日志内容：${content}`;

            return this.saveLog(log_item);
        },

        /**
         * 保存日志
         * @param {*} log_item 
         */
        saveLog: function (log_item) {
            let self = this;
            log_item.content = log_item.content || "";
            log_item.process_id = process.pid;
            return self.db.SystemTaskLog.build(log_item).save()
        },

        /**同步任务进程表 */
        syncTaskProcess: async function () {
            let self = this;

            Object.keys(self.task_list).map(task_id => {
                //遍历当前进程运行的任务
                let queue_length = self.task_list[task_id] && self.task_list[task_id].queue ? self.task_list[task_id].queue.queue.length : 0;

                let options = {
                    process_id: process.pid,
                    task_id: task_id,
                    queue_length: queue_length
                };

                self.db.SystemTaskProcess.build(options).save();
            })
        },

        /**初始化Redis SubScribe*/
        initRedisSubScribe() {
            let self = this;

            //#region 普通订阅
            //普通订阅-监听订阅成功事件
            sub.on("subscribe", function (channel, count) {
                console.log("普通订阅成功，频道：" + channel + ", 订阅数" + count);
            });

            //普通订阅-监听取消订阅事件
            sub.on("unsubscribe", function (channel, count) {
                console.log("普通订阅取消成功，频道：" + channel + ", 订阅数" + count);
            });

            //普通订阅收到消息
            sub.on("message", function (channel, message) {
                console.log("接收到频道消息" + channel + ": " + message);

                switch (channel) {
                    //停止全部
                    case self.RedisChannelKey.STOPALL:
                        self.stopAll();
                        break;
                    //重启单任务
                    case self.RedisChannelKey.RESTARTSINGLE:
                        self.ReStart(JSON.parse(message))
                        break;
                    //取消单任务
                    case self.RedisChannelKey.CANCELSINGLE:
                        self.Cancel(message);
                        break;
                    //取消单任务最近一次运行
                    case self.RedisChannelKey.CANCELNEXTSINGLE:
                        self.CancelNext(message);
                        break;
                    //同步任务进程表
                    case self.RedisChannelKey.SYNCTASKPROCESS:
                        self.syncTaskProcess();
                        break;
                }
            });

            //遍历普通订阅
            Object.keys(self.RedisChannelKey).map(item => {
                sub.subscribe(self.RedisChannelKey[item]);
            })
            //#endregion

            //#region 模式订阅
            //模式订阅-监听订阅成功事件
            sub.on("psubscribe", function (pattern, count) {
                console.log("模式订阅成功，模式：" + pattern + ", 订阅数" + count);
            });

            //模式订阅-监听取消订阅事件
            sub.on("punsubscribe", function (pattern, count) {
                console.log("模式订阅取消成功，模式：" + pattern + ", 订阅数" + count);
            });

            //模式订阅收到消息
            sub.on("pmessage", function (pattern, channel, message) {
                console.log(`模式订阅 收到信息， 模式：${pattern}，频道：${channel}，消息 ${message}`);

                switch (pattern) {
                    //启动任务
                    case getRedisPatternKey(self.RedisPatternChannelKey.PatternTaskChannelID):
                        self.Start(message);
                        break;
                }
            });

            //遍历模式订阅
            Object.keys(self.RedisPatternChannelKey).map(item => {
                sub.psubscribe(getRedisPatternKey(self.RedisPatternChannelKey[item]));
            })
            //#endregion

            function getRedisPatternKey(item) {
                return `*${item}*`
            }
        },

        /**
         * 发布Redis消息
         * @param {*} channel 
         * @param {*} data
         */
        pubRedisChannel: async function (channel, data) {
            data = data || channel;

            if (!_.isString(data) && _.isObject(data))
                data = JSON.stringify(data);

            console.log("发布频道消息" + channel + ": " + data);

            //发送
            return await pub.publishAsync(channel, data);
        }
    }

    // 初始化Redis SubScribe
    sub.on("ready", function () {
        TaskMgr.initRedisSubScribe();
    });

    return TaskMgr;
}

var initTask = [{
    "name": "定时更新任务进程",
    "type": "remote",
    "method": "get",
    "path": "http://localhost:8889/system/tasks/sync_taskprocess",
    "params": "{\"headers\":{\"Authorization\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsiYXBwX2lkIjoiMSIsIm5hbWUiOiIyIiwiZGVzY3JpcHRpb24iOiIzIiwidmFsaWQiOnRydWV9LCJ1c2VyIjp7InVzZXJfaWQiOiIxIiwiYWNjb3VudCI6IjIiLCJuYW1lIjoiMyIsImVtYWlsIjoiMTIzQHFxLmNvbSIsImRlc2NyaXB0aW9uIjoid2Vxd2Vxd2Vxd2UiLCJ2YWxpZCI6dHJ1ZSwicm9sZXMiOltdfSwiZXhwaXJlc0F0IjoxNTY0OTA0MjQ2NTM5LCJpYXQiOjE1NjQ4OTcwNDZ9.gmPzdA_dubKzubiTNcwrny89h5mFczY1sBRhQ8-ef9s\"}}",
    "process_number": 1,
    "parallel_number": 1,
    "valid": true,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/5 * * * * ?",
    "description": "定时更新任务进程"
}, {
    "task_id": "1",
    "name": "任务1",
    "type": "local",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/tasks/index2.js",
    "process_number": 1,
    "parallel_number": 1,
    "valid": true,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/1 * * * * ?",
    "description": "任务1"
}, {
    "task_id": "2",
    "name": "任务2",
    "type": "local",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/tasks/index2.js",
    "process_number": 6,
    "parallel_number": 1,
    "valid": true,
    "status": "running",
    "start_time": "2019-07-30T16:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/2 * * * * ?",
    "description": "任务2"
}, {
    "task_id": "3",
    "name": "任务3",
    "type": "local",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/tasks/index2.js",
    "process_number": 2,
    "parallel_number": 1,
    "valid": true,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/3 * * * * ?",
    "description": "任务3"
}, {
    "task_id": "4",
    "name": "任务4",
    "type": "local",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/tasks/index2.js",
    "process_number": 3,
    "parallel_number": 1,
    "valid": true,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/4 * * * * ?",
    "description": "任务4"
}, {
    "task_id": "5",
    "name": "任务5",
    "type": "local",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/tasks/index.js",
    "process_number": 4,
    "parallel_number": 1,
    "valid": true,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/5 * * * * ?",
    "description": "任务5"
}, {
    "task_id": "6",
    "name": "博客园",
    "type": "local",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/libs/cnblogs/V4/index.js",
    "process_number": 1,
    "parallel_number": 1,
    "valid": false,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/5 * * * * ?",
    "description": "博客园"
}, {
    "task_id": "7",
    "name": "博客园-消费者",
    "type": "process",
    "method": null,
    "path": "D:/WorkSpace/Framework/HapiSimple/libs/cnblogs/V4/rabbit-consumer.js",
    "process_number": 1,
    "parallel_number": 1,
    "valid": false,
    "status": "running",
    "start_time": "2019-07-31T00:00:00.000Z",
    "end_time": "2019-08-31T15:59:59.000Z",
    "cron": "*/5 * * * * ?",
    "description": "博客园-消费者"
}]