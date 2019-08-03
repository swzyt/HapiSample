'use strict'

const schedule = require("node-schedule");
const moment = require("moment");
const restler = require("./restler");
const Bagpipe = require('bagpipe');

module.exports = function (db) {
    let keyPrefix = 'task-',
        redisKey = 'local-task';

    let pub = db.cache.redis.createClient(db.cache.settings.redis.port, db.cache.settings.redis.host),
        sub = db.cache.redis.createClient(db.cache.settings.redis.port, db.cache.settings.redis.host);

    var TaskMgr = {

        /**Redis 订阅 KEY*/
        RedisChannelKey: {
            /**启动全部*/
            STARTALL: `${redisKey}-StartAll`,
            /**停止全部*/
            STOPALL: `${redisKey}-StopAll`,
            /**重启单任务*/
            RESTARTSINGLE: `${redisKey}-ReStartSingle`,
            /**取消单任务*/
            CANCELSINGLE: `${redisKey}-CancelSingle`,
        },

        /**任务日志描述*/
        TaskLogType: {
            /**启动任务 */
            STARTLOG: '启动任务',
            /**取消任务 */
            CANCELLOG: '取消任务',
            /**取消最近一次的执行任务 */
            CANCELNEXT: '取消最近一次的执行任务'
        },

        /**数据库连接对象*/
        db,

        /**初始化任务列表至Redis*/
        async init() {
            let self = this;

            let redis_list_len = await self.db.cache.client.llenAsync(redisKey);

            //redis中任务队列长度为0时，才执行初始化
            if (!!!redis_list_len) {

                let tasks = await self.db.SystemTask.findAll({ where: { valid: true } })

                if (tasks && tasks.length > 0) {
                    //添加到redis
                    for (let i = 0; i < tasks.length; i++) {
                        let item_str = JSON.stringify(tasks[i])

                        await self.db.cache.client.lremAsync(redisKey, 0, item_str);

                        await self.db.cache.client.lpushAsync(redisKey, item_str)
                    }

                    // setTimeout(() => { 

                    // }, 1000)

                    // //多进程启动会导致redis重复，此处整理重复key
                    // redis_list_len = await self.db.cache.client.llenAsync(redisKey);

                    // let redis_list = await self.db.cache.client.lrangeAsync(redisKey, 0, redis_list_len);
                    // redis_list = [...new Set(redis_list)];

                    // await self.db.cache.client.ltrimAsync(redisKey, redis_list_len, redis_list_len);

                    // await self.db.cache.client.lpushAsync(redisKey, ...redis_list)

                    // tasks
                    //     .map(item => {
                    //         let item_str = JSON.stringify(item)

                    //         //初始化任务列表到redis
                    //         self.db.cache.client.lrem(redisKey, 0, item_str, function () {
                    //             self.db.cache.client.lpush(redisKey, item_str)
                    //         })
                    //     })
                }
            }

            sub.on("message", function (channel, message) {
                console.log("sub channel " + channel + ": " + message);

                switch (channel) {
                    //启动全部
                    case self.RedisChannelKey.STARTALL:
                        self.startAll();
                        break;
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
                }

            });
            //订阅-启动全部
            sub.subscribe(self.RedisChannelKey.STARTALL);
            //订阅-停止全部
            sub.subscribe(self.RedisChannelKey.STOPALL);
            //订阅-重启单任务
            sub.subscribe(self.RedisChannelKey.RESTARTSINGLE);
            //订阅-取消单任务
            sub.subscribe(self.RedisChannelKey.CANCELSINGLE);
        },

        /**启动全部*/
        startAll: async function () {
            let self = this;

            //从redis 队列中取出待执行的任务
            let redisItem = await self.db.cache.client.lpopAsync(redisKey);

            if (redisItem) {
                let item = JSON.parse(redisItem)

                //任务配置有效，则运行
                if (self.checkTaskItem(item)) {
                    await self.Run(item)
                }

                //遍历下一项任务
                self.startAll();
            }
        },

        /**停止全部*/
        stopAll: async function () {
            let self = this;

            Object.keys(self.task_list).map(item => {
                //遍历当前进程运行的任务，并全部取消
                let task_id = item.split(keyPrefix)[1];
                self.Cancel(task_id);
            })

            return Promise.resolve(true);
        },

        /**运行中的任务列表*/
        task_list: {},

        /**
         * 拼接任务id key
         * @param {*} task_id 
         */
        getTaskKey(task_id) {
            return `${keyPrefix}${task_id}`;
        },
        /**
         * 检测任务在当前进程是否存在
         * @param {*} task_id 
         */
        checkTaskList(task_id) {
            let task_key = this.getTaskKey(task_id);

            let result = task_id && this.task_list[task_key];

            console.log(`任务 ${task_key} 在当前进程 ${process.pid} 中 ${result ? '存在' : '不存在'}`)

            return result
        },
        /**
         * 检测任务有效性
         * @param {*} item 
         */
        checkTaskItem(item) {
            let result = item &&
                item.valid &&
                item.status == "running" &&
                item.path &&
                item.cron &&
                item.parallel_number &&
                (!item.start_time || moment().isAfter(moment(item.start_time))) &&
                (!item.end_time || moment().isBefore(moment(item.end_time)))

            console.log(`任务 ${task_key} 在当前进程 ${process.pid} 中 ${result ? '可运行' : '不可运行'}`)

            return result
        },
        /**
         * 运行任务
         * @param {*} item 
         */
        Run: async function (item) {
            let self = this;

            try {
                let task_key = self.getTaskKey(item.task_id);

                //若任务已存在，则先取消并从内存中删除
                await self.Cancel(item.task_id)

                //检测任务有效性
                if (!self.checkTaskItem(item)) {
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

                    let job = schedule.scheduleJob(task_key, job_rule, async function () {

                        const t = async function () {
                            //运行日志
                            let task_log = self.getLogItem(item.task_id, job);

                            try {
                                // let fun = require("D:/WorkSpace/Framework/HapiSimple/tasks/index.js")
                                //本地任务
                                if (item.type == "local") {
                                    let fun = require(item.path);
                                    task_log.content = JSON.stringify(await fun());
                                }
                                //远程任务
                                else if (item.type == "remote") {
                                    task_log.content = await restler[item.method](item.path)
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

                            task_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

                            await self.saveLog(task_log)

                            //本次任务执行完毕，执行下一次计划
                            self.task_list[task_key] && self.task_list[task_key].queue && self.task_list[task_key].queue._next();

                        }

                        //推入任务待执行队列，控制并行数
                        self.task_list[task_key] && self.task_list[task_key].queue && self.task_list[task_key].queue.push(t)
                    });

                    //初始化当前任务执行队列，可控制并行数
                    let queue = new Bagpipe(item.parallel_number || 1)
                    queue.on('full', function (length) {
                        console.warn(`${task_key} 待执行队列长度为: ${length}`);
                    });

                    //保存任务对象
                    self.task_list[task_key] = { job: job, queue: queue };
                }
                else if (item.type == "process") {

                    let pro = require(item.path);

                    //启动任务
                    pro && pro.start && pro.start();

                    //保存任务对象
                    self.task_list[task_key] = { process: [pro] };
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
                // await this.Cancel(item.task_id);

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
            let task_key = this.getTaskKey(task_id);
            if (this.checkTaskList(task_id)) {
                //本地任务或远程任务
                if (this.task_list[task_key] && this.task_list[task_key].job) {
                    this.task_list[task_key].job.cancel(reschedule);
                }
                //本次进程任务
                else if (this.task_list[task_key] && this.task_list[task_key].process) {
                    this.task_list[task_key].process.map(item => {
                        item.exit && item.exit();
                    })
                }
                delete this.task_list[task_key]

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
            let task_key = this.getTaskKey(task_id);
            if (this.checkTaskList(task_id)) {

                if (this.task_list[task_key] && this.task_list[task_key].job) {
                    this.task_list[task_key].job.cancelNext(reschedule);

                    //取消最近一次的执行任务日志
                    return await this.saveNormalLog(task_id, this.TaskLogType.CANCELNEXT);
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
            let task_key = this.getTaskKey(task_id);

            let log_item = this.getLogItem(task_id, this.task_list[task_key] ? this.task_list[task_key].job : null);

            log_item.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

            log_item.content = content;

            return this.saveLog(log_item);
        },
        /**
         * 保存日志
         * @param {*} log_item 
         */
        saveLog: function (log_item) {
            let self = this;
            log_item.content = log_item.content || ""
            log_item.process_id = process.pid;
            return self.db.SystemTaskLog.build(log_item).save().then(item => {
                return self.db.SystemTask.update({ process_id: log_item.process_id }, { where: { task_id: log_item.task_id } }).then(() => {
                    return item
                })
            });
        },

        pubRedisChannel: function (type, data) {
            let self = this;
            switch (type) {
                //启动全部
                case self.RedisChannelKey.STARTALL:
                    pub.publish(self.RedisChannelKey.STARTALL, self.RedisChannelKey.STARTALL);
                    break;
                //停止全部
                case self.RedisChannelKey.STOPALL:
                    pub.publish(self.RedisChannelKey.STOPALL, self.RedisChannelKey.STOPALL);
                    break;
                //重启单任务
                case self.RedisChannelKey.RESTARTSINGLE:
                    pub.publish(self.RedisChannelKey.RESTARTSINGLE, JSON.stringify(data));
                    break;
                //取消单任务
                case self.RedisChannelKey.CANCELSINGLE:
                    pub.publish(self.RedisChannelKey.CANCELSINGLE, JSON.stringify(data));
                    break;
            }
        }
    }

    //初始化任务队列
    TaskMgr.init();

    return TaskMgr;
}