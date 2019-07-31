const schedule = require("node-schedule");
const moment = require("moment");
const restler = require("./restler")

module.exports = function (db) {
    var TaskMgr = {
        db,

        init() {
            let self = this;

            self.db.SystemTask.findAll({ where: { valid: true } }).then(tasks => {
                if (tasks && tasks.length > 0) {
                    tasks
                        .filter(item => {
                            return self.checkTaskItem(item)
                        })
                        .map(item => {
                            self.Run(item);
                        })
                }
            })
        },

        task_list: {
        },
        /**
         * 拼接任务id key
         * @param {*} id 
         */
        getTaskId(id) {
            return `task-${id}`;
        },
        /**
         * 检测任务是否存在
         * @param {*} id 
         */
        checkTaskList(id) {
            return id && this.task_list[this.getTaskId(id)]
        },
        /**
         * 检测任务有效性
         * @param {*} item 
         */
        checkTaskItem(item) {
            return item &&
                item.valid &&
                item.status == "running" &&
                item.cron &&
                (!item.start_time || (moment().isAfter(moment(item.start_time)))) &&
                (!item.end_time || (moment().isBefore(moment(item.end_time))))
        },
        /**
         * 运行任务
         * @param {*} item 
         */
        Run: function (item) {
            let self = this;

            if (!self.checkTaskItem(item)) {
                return;
            }

            let task_id = this.getTaskId(item.task_id);

            let job_rule = { rule: item.cron };
            if (item.start_time) {
                job_rule.start = item.start_time;
            }
            if (item.end_time) {
                job_rule.end = item.end_time;
            }

            let job = schedule.scheduleJob(task_id, job_rule, async function () {
                //运行日志
                let task_log = self.getLogItem(item.task_id, job);

                task_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

                try {
                    // let fun = require("D:/WorkSpace/Framework/HapiSimple/tasks/index.js")
                    if (item.type == "local") {
                        let fun = require(item.path);
                        task_log.content = JSON.stringify(await fun(task_log.task_id + " " + task_log.start_time));
                    }
                    else if (item.type == "remote") {
                        task_log.content = await restler[item.method](item.path)
                    }
                }
                catch (err) {
                    task_log.content = JSON.stringify({
                        code: err.code,
                        message: err.message,
                        stack: err.stack
                    })
                }

                self.saveLog(task_log)
            });

            //创建日志
            let create_log = self.getLogItem(item.task_id, job);
            create_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
            create_log.content = "启动任务";
            self.saveLog(create_log)

            self.task_list[task_id] = job;
        },
        /**
         * 重启任务
         * @param {*} id 
         * @param {*} spec 
         */
        ReSchedule: function (id, spec) {
            let task_id = this.getTaskId(id);
            if (this.checkTaskList(id)) {
                this.task_list[task_id].reschedule(spec)
            }
        },
        ReStart: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTaskList(id)) {
                this.task_list[task_id].cancel(true);

                //重启日志
                let restart_log = this.getLogItem(id, this.task_list[task_id]);
                restart_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
                restart_log.content = "重启任务";
                this.saveLog(restart_log)
            }
        },
        /**
         * 取消任务
         * @param {*} id 
         */
        Cancel: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTaskList(id)) {
                this.task_list[task_id].cancel();
                //取消日志
                let cancel_log = this.getLogItem(id, this.task_list[task_id]);
                cancel_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
                cancel_log.content = "取消任务";
                this.saveLog(cancel_log)
            }
        },
        /**
         * 取消最近一次的执行任务
         * @param {*} id 
         */
        CancelNext: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTaskList(id)) {
                this.task_list[task_id].cancelNext(true);
                //取消日志
                let cancel_log = this.getLogItem(id, this.task_list[task_id]);
                cancel_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
                cancel_log.content = "取消最近一次的执行任务";
                this.saveLog(cancel_log)
            }
        },
        /**
         * 取消任务并从列表中移除
         * @param {*} id 
         */
        Remove: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTaskList(id)) {
                this.task_list[task_id].cancel();

                //取消日志
                let cancel_log = this.getLogItem(id, this.task_list[task_id]);
                cancel_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
                cancel_log.content = "取消任务并从列表中移除";
                this.saveLog(cancel_log)

                delete this.task_list[task_id]
            }
        },
        //实例化日志对象
        getLogItem: function (task_id, job) {
            return {
                task_id,
                start_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                next_time: job.nextInvocation() ? moment(job.nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss") : null,
                content: job.name

            }
        },
        //保存日志
        saveLog: function (data) {
            this.db.SystemTaskLog.build(data).save();
        }
    }

    //初始化任务队列
    TaskMgr.init();

    return TaskMgr;
}