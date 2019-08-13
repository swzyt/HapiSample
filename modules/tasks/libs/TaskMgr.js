const schedule = require("node-schedule"),
    _ = require('lodash'),
    moment = require("moment"),
    restler = require("./restler"),
    Bagpipe = require('bagpipe'),
    os = require("os");


// Redis 配置

/**Redis 任务平台主机进程记录 KEY */
const RedisTaskHostProcess = "LOCAL-TASK-HOST-PROCESS";

/**Redis 任务平台主机进程数 KEY */
const RedisTaskProcessCount = "LOCAL-TASK-PROCESS-COUNT";

/**Redis KEY 前缀 */
const RedisTaskListKeyPrefix = 'LOCAL-TASK-LIST';

/**Redis Run Limit KEY 前缀 */
const RedisRunLimitKeyPrefix = 'LOCAL-TASK-RUN-LIMIT';

/**Redis 普通订阅 KEY */
const RedisChannelKey = {
    /**停止全部*/
    STOPALL: `${RedisTaskListKeyPrefix}-StopAll`,
    /**重启单任务*/
    RESTARTSINGLE: `${RedisTaskListKeyPrefix}-ReStartSingle`,
    /**取消单任务*/
    CANCELSINGLE: `${RedisTaskListKeyPrefix}-CancelSingle`,
    /**同步任务进程表*/
    SYNCTASKPROCESS: `${RedisTaskListKeyPrefix}-SyncTaskProcess`,
};

/**Redis 模式订阅 KEY */
const RedisPatternChannelKey = {
    /**订阅任务ID，模式匹配 */
    PatternTaskChannelID: `${RedisTaskListKeyPrefix}-TaskChannelID-`
};


// 日志配置

/**任务日志描述 */
const TaskLogType = {
    /**启动任务 */
    STARTLOG: '启动任务',
    /**取消任务 */
    CANCELLOG: '取消任务',
    /**取消最近一次的执行任务 */
    CANCELNEXTLOG: '取消最近一次的执行任务'
};


// 定时器配置

/**默认N秒后，启动全部任务 */
const TimeOut_StartAll = 1000 * 15;

/**默认每N秒，同步任务进程表 */
const Interval_SyncTaskProcess = 1000 * 10;


/**获取主机名 */
function _getHostName() {
    return os.hostname();
}

class TaskMgr {
    //构造函数
    constructor(db) {
        /**数据库连接对象 */
        this.db = db;

        /**运行中的任务列表 */
        this.task_list = {};

        /**redis 发布 客户端 */
        this.pub = db.cache.redis.createClient(db.cache.settings.redis);
        /**redis 订阅 客户端 */
        this.sub = db.cache.redis.createClient(db.cache.settings.redis);

        // 初始化Redis Events
        this.initRedisEvents();

        this.initFirstProcess();
    }

    //======================Redis 初始化、清除方法，连接事件、订阅事件监控======================

    /**初始化Redis All */
    async initRedisAll() {
        let self = this;

        await self.clearRedisAll();

        let tasks = await self.db.SystemTask.findAll({ where: { valid: true, status: 'running' } })
        if (tasks && tasks.length > 0) {
            for (let i = 0; i < tasks.length; i++) {
                if (self.checkTaskItemValid(tasks[i])) {
                    await self.initRedisSingle(tasks[i])
                }
            }
        }
    }

    /**初始化Redis Single */
    async initRedisSingle(item) {
        let self = this;

        await self.clearRedisSingle(item.task_id);

        await self.pushToRedis(item);
    }

    /**push 任务列表、任务运行次数限制 至Redis */
    async pushToRedis(item) {
        let self = this;

        let item_str = JSON.stringify(item);

        // 支持任务多进程运行
        // 追加到队列尾部
        let redis_task_key = `${RedisTaskListKeyPrefix}:${item.task_id}`;
        await self.db.cache.client.rpushAsync(redis_task_key, ...Array.from({ length: await self.getRunProcessCount(item.process_number) }, (item, index) => { return item_str }));

        // 设置任务可运行次数
        if (item.run_limit) {
            let redis_run_limit_key = `${RedisRunLimitKeyPrefix}:${item.task_id}`;
            await self.db.cache.client.rpushAsync(redis_run_limit_key, ...Array.from({ length: item.run_limit }, (item, index) => { return redis_run_limit_key }));
        }
    }

    /**清除Redis All 任务列表、运行次数限制 */
    async clearRedisAll() {
        let self = this;

        // 清除任务列表
        let keys = await self.db.cache.client.keysAsync(`${RedisTaskListKeyPrefix}*`);
        if (keys && keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                await self.delRedis(keys[i]);
            }
        }
        // 清除任务运行次数限制列表
        keys = await self.db.cache.client.keysAsync(`${RedisRunLimitKeyPrefix}*`);
        if (keys && keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                await self.delRedis(keys[i]);
            }
        }
    }

    /**清除Redis Single 任务列表、运行次数限制 */
    async clearRedisSingle(task_id) {

        // 清除任务列表
        await this.delRedis(`${RedisTaskListKeyPrefix}:${task_id}`);

        // 清除任务运行次数限制列表
        await this.delRedis(`${RedisRunLimitKeyPrefix}:${task_id}`);
    }

    /**删除Redis KEY */
    async delRedis(key) {
        return await this.db.cache.client.delAsync(key);
    }

    /**初始化Redis Events*/
    initRedisEvents() {
        let self = this;

        //#region 普通订阅
        //普通订阅-监听订阅成功事件
        self.sub.on("subscribe", function (channel, count) {
            console.log("普通订阅成功，频道：" + channel + ", 订阅数" + count);
        });

        //普通订阅-监听取消订阅事件
        self.sub.on("unsubscribe", function (channel, count) {
            console.log("普通订阅取消成功，频道：" + channel + ", 订阅数" + count);
        });

        //普通订阅收到消息
        self.sub.on("message", function (channel, message) {
            console.log("接收到频道消息" + channel + ": " + message);

            switch (channel) {
                //停止全部
                case RedisChannelKey.STOPALL:
                    self._stopAll();
                    break;
                //取消单任务
                case RedisChannelKey.CANCELSINGLE:
                    self._Cancel(message);
                    break;
                //同步任务进程表
                case RedisChannelKey.SYNCTASKPROCESS:
                    self._syncTaskProcess();
                    break;
            }
        });

        //遍历普通订阅
        Object.keys(RedisChannelKey).map(item => {
            self.sub.subscribe(RedisChannelKey[item]);
        })
        //#endregion

        //#region 模式订阅
        //模式订阅-监听订阅成功事件
        self.sub.on("psubscribe", function (pattern, count) {
            console.log("模式订阅成功，模式：" + pattern + ", 订阅数" + count);
        });

        //模式订阅-监听取消订阅事件
        self.sub.on("punsubscribe", function (pattern, count) {
            console.log("模式订阅取消成功，模式：" + pattern + ", 订阅数" + count);
        });

        //模式订阅收到消息
        self.sub.on("pmessage", function (pattern, channel, message) {
            console.log(`模式订阅 收到信息， 模式：${pattern}，频道：${channel}，消息 ${message}`);

            switch (pattern) {
                //启动单项任务
                case getRedisPatternKey(RedisPatternChannelKey.PatternTaskChannelID):
                    self.StartSingle(message);
                    break;
            }
        });

        //遍历模式订阅
        Object.keys(RedisPatternChannelKey).map(item => {
            self.sub.psubscribe(getRedisPatternKey(RedisPatternChannelKey[item]));
        })

        function getRedisPatternKey(item) {
            return `*${item}*`
        }
        //#endregion

        // pub/sub 客户端事件
        self.pub.on("ready", function () {
            console.log("Pub Redis Ready ");
        });
        self.pub.on("error", function (err) {
            console.log("Pub Redis Error " + err);
        });

        // 初始化Redis SubScribe
        self.sub.on("ready", function () {
            console.log("Sub Redis Ready ");
        });
        self.sub.on("error", function (err) {
            console.log("Sub Redis Error " + err);
        });
    }

    /** 发布Redis频道消息 */
    async pubRedisChannel(channel, data) {
        data = data || channel;

        if (!_.isString(data) && _.isObject(data))
            data = JSON.stringify(data);

        console.log("发布频道消息" + channel + ": " + data);

        //发送
        return await this.pub.publishAsync(channel, data);
    }

    //======================首个进程事件处理======================

    /**监控第一个启动的进程，由它延时启动全部任务、同步任务进程表 */
    async initFirstProcess() {
        let self = this;

        let redis_value = `${_getHostName()}:${process.pid}`
        await self.db.cache.client.rpushAsync(RedisTaskHostProcess, redis_value);

        let first_item = await self.db.cache.client.lindexAsync(RedisTaskHostProcess, 0);

        // 判断当前进程是否为第一个运行的进程，若是，则执行定时操作
        if (first_item == redis_value) {
            console.log(`The First Process Running! ${redis_value}`)

            // 定时器，触发启动全部任务
            setTimeout(async function () {

                await self.db.cache.client.setAsync(RedisTaskProcessCount, await self.db.cache.client.llenAsync(RedisTaskHostProcess))

                await self.delRedis(RedisTaskHostProcess);

                await self.initRedisAll();

                await self.startAll();

            }, TimeOut_StartAll);

            //循环任务，每N秒检测任务进程合理性，并同步任务进程表
            setInterval(async function () {
                await self.checkTaskProcess();

                await self.syncTaskProcess();
            }, Interval_SyncTaskProcess)
        }
    }

    //======================从Redis获取当前部署的任务平台进程数======================

    /**获取任务运行最大进程数 */
    async getRunProcessCount(number) {
        let self = this;

        let maxProcessCount = parseInt((await self.db.cache.client.getAsync(RedisTaskProcessCount)) || 1);

        number = number || 1;
        return number > maxProcessCount ? maxProcessCount : number;
    }

    //======================任务有效性检测======================

    /**检测任务在当前进程是否存在 */
    checkTaskList(task_id) {
        let result = task_id && this.task_list[task_id];

        console.log(`任务 ${task_id} 在当前主机 ${_getHostName()} 的进程 ${process.pid} 中 ${result ? '已存在' : '不存在'}`)

        return result;
    }

    /**检测任务有效性 */
    checkTaskItemValid(item) {
        let result = item &&
            item.valid &&
            item.status == "running" &&
            item.path &&
            item.cron &&
            item.parallel_number &&
            item.process_number &&
            (!item.start_time || moment().isAfter(moment(item.start_time))) &&
            (!item.end_time || moment().isBefore(moment(item.end_time)))

        console.log(`任务 ${item.task_id} 在当前主机 ${_getHostName()} 的进程 ${process.pid} 中 ${result ? '可运行' : '不可运行'}`)

        return result;
    }

    /**检测任务运行进程数是否合理，否则重新运行 */
    async checkTaskProcess() {
        let self = this;

        let options = {
            distinct: true,
            include: [{
                //任务进程
                model: self.db.SystemTaskProcess,
                as: "processs",
                required: false
            }],
            where: { valid: true, status: 'running' }
        };
        let tasks = await self.db.SystemTask.findAll(options)

        if (tasks && tasks.length > 0) {
            for (let i = 0; i < tasks.length; i++) {
                //判断任务当前进程数是否大于配置值，若是，则取消后重新运行
                if (tasks[i].processs.length > tasks[i].process_number) {
                    await self.Cancel(tasks[i].task_id);

                    await self.createTask(tasks[i]);
                }
            }
        }
    }

    //======================任务启动与停止======================

    /**发布启动全部任务消息 */
    async startAll() {
        let self = this;

        let keys = await self.db.cache.client.keysAsync(`${RedisTaskListKeyPrefix}*`);

        if (keys && keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];

                let channel = `${RedisPatternChannelKey.PatternTaskChannelID}${key.split(':')[1]}`;

                //通知各进程运行任务
                await self.pubRedisChannel(channel, key);
            }
        }
        return keys.length;
    }

    /**创建任务后，发布启动单项任务消息 */
    async createTask(item) {
        let self = this;

        await self.initRedisSingle(item);

        let channel = `${RedisPatternChannelKey.PatternTaskChannelID}${item.task_id}`;

        //通知各进程运行任务
        await self.pubRedisChannel(channel, `${RedisTaskListKeyPrefix}:${item.task_id}`);
    }

    /**启动单项任务 */
    async StartSingle(channel) {
        let self = this;

        //从redis 队列头部取出待执行的任务
        let redisItem = await self.db.cache.client.lpopAsync(channel);

        if (redisItem) {
            return await self.Run(JSON.parse(redisItem))
        }
        return null;
    }

    /**发布停止全部任务消息 */
    async stopAll() {
        let self = this;

        //清除Redis
        await self.clearRedisAll();

        return await self.pubRedisChannel(RedisChannelKey.STOPALL);
    }

    /**停止当前进程全部任务 */
    async _stopAll() {
        let self = this;

        Object.keys(self.task_list).map(task_id => {
            // 遍历当前进程运行的任务，并全部取消
            self._Cancel(task_id);
        })

        return null;
    }

    /**运行任务 */
    async Run(item) {
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
                            let task_log = self.getLogItem(item.task_id);

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
                                    task_log.content = JSON.stringify(await restler[item.method](item.path, item.params ? JSON.parse(item.params) : null));
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
            await self.saveStartCancelLog(item.task_id, TaskLogType.STARTLOG);

            return null;
        }
        catch (err) {
            console.log(err)
            return err
        }
    }

    /**发布取消任务消息 */
    async Cancel(task_id) {
        let self = this;

        // 先清除单项任务Redis
        await self.clearRedisSingle(task_id);
        // 先取消并删除
        return await self.pubRedisChannel(RedisChannelKey.CANCELSINGLE, task_id);
    }
    /**
     * 取消任务
     * 所有的计划调用将会被取消。当你设置 reschedule 参数为true，然后任务将在之后重新排列。
     */
    async _Cancel(task_id, reschedule = false) {
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

            //删除进程记录
            await this.db.SystemTaskProcess.destroy({ where: { process_id: process.pid } })

            //取消日志
            return await this.saveStartCancelLog(task_id, TaskLogType.CANCELLOG);
        }
        return null;
    }

    //======================日志======================

    /**实例化日志对象 */
    getLogItem(task_id) {
        let job = this.task_list[task_id] ? this.task_list[task_id].job : null;

        return {
            task_id,
            start_time: moment().format("YYYY-MM-DD HH:mm:ss"),
            next_time: job && job.nextInvocation() ? moment(job.nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss") : null,
            log_type: 'RUN',

            host: _getHostName(),
            process_id: process.pid
        }
    }

    /**任务启停日志 */
    saveStartCancelLog(task_id, content) {
        let log_item = this.getLogItem(task_id);

        log_item.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

        log_item.log_type = 'START_CANCEL';

        log_item.content = content;

        return this.saveLog(log_item);
    }

    /**保存日志 */
    saveLog(log_item) {
        let self = this;

        log_item.content = log_item.content || "";

        return self.db.SystemTaskLog.build(log_item).save()
    }

    //======================同步进程======================

    /**发布同步任务进程表消息 */
    async syncTaskProcess() {
        let self = this;

        //删除所有进程记录
        await self.db.SystemTaskProcess.destroy({ where: { process_id: { $gt: 0 } } })

        return await self.pubRedisChannel(RedisChannelKey.SYNCTASKPROCESS);
    }
    /**同步任务进程表 */
    async _syncTaskProcess() {
        let self = this;

        //遍历任务列表
        Object.keys(self.task_list).map(task_id => {
            //获取任务待执行队列数
            let queue_length = self.task_list[task_id] && self.task_list[task_id].queue ? self.task_list[task_id].queue.queue.length : 0;

            let options = {
                host: _getHostName(),
                process_id: process.pid,
                task_id: task_id,
                queue_length: queue_length
            };

            self.db.SystemTaskProcess.build(options).save();
        })
    }
}

module.exports = TaskMgr;