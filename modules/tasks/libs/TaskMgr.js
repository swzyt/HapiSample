const schedule = require("node-schedule");
const moment = require("moment");
const restler = require("./restler")
const Bagpipe = require('bagpipe');

module.exports = function (db) {
    var TaskMgr = {
        /**
         * 数据库连接对象
         */
        db,
        /**
         * 初始化任务列表
         */
        async init() {
            let self = this;

            let tasks = await self.db.SystemTask.findAll({ where: { valid: true } })

            if (tasks && tasks.length > 0) {
                tasks
                    .filter(item => {
                        return self.checkTaskItem(item)
                    })
                    .map(item => {
                        self.Run(item);
                    })
            }
        },
        /**
         * 运行中的任务列表
         */
        task_list: {},
        /**
         * 拼接任务id key
         * @param {*} task_id 
         */
        getTaskKey(task_id) {
            return `task-${task_id}`;
        },
        /**
         * 检测任务是否存在
         * @param {*} task_id 
         */
        checkTaskList(task_id) {
            let task_key = this.getTaskKey(task_id);

            let result = task_id && this.task_list[task_key];

            console.log(`任务 ${task_key} ${result ? '存在' : '不存在'}`)

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

            console.log(`任务 ${this.getTaskKey(item.task_id)} ${result ? '启动' : '未启动'}`)

            return result
        },
        /**
         * 运行任务
         * @param {*} item 
         */
        Run: async function (item) {
            try {
                let self = this;

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

                        //推入任务待执行队列，可控制并行数
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
                await self.saveNormalLog(item.task_id, "启动任务");

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
            //先取消
            // await this.Cancel(item.task_id);

            //再运行
            return await this.Run(item);
        },
        /**
         * 取消任务
         * 所有的计划调用将会被取消。当你设置 reschedule 参数为true，然后任务将在之后重新排列。
         * @param {*} task_id 
         */
        Cancel: async function (task_id, reschedule = false) {
            let task_key = this.getTaskKey(task_id);
            if (this.checkTaskList(task_id)) {
                if (this.task_list[task_key] && this.task_list[task_key].job) {
                    this.task_list[task_key].job.cancel(reschedule);
                }
                else if (this.task_list[task_key] && this.task_list[task_key].process) {
                    // this.task_list[task_key].process = []
                    this.task_list[task_key].process.map(item => {
                        item.exit && item.exit();
                    })
                }
                delete this.task_list[task_key]

                //取消日志
                return await this.saveNormalLog(task_id, "取消任务");
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
                    return await this.saveNormalLog(task_id, "取消最近一次的执行任务");
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
                next_time: job && job.nextInvocation() ? moment(job.nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss") : null,
                content: job ? job.name : ""
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
            log_item.content = log_item.content || ""
            return this.db.SystemTaskLog.build(log_item).save();
        }
    }

    //初始化任务队列
    TaskMgr.init();

    return TaskMgr;
}