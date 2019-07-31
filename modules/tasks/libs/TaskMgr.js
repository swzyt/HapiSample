const schedule = require("node-schedule");
const moment = require("moment");

module.exports = function (db) {
    var TaskMgr = {
        db,

        init() {
            let self = this;

            self.db.SystemTask.findAll({ where: { valid: true } }).then(tasks => {
                if (tasks && tasks.length > 0) {
                    tasks
                        .filter(item => {
                            return item.valid &&
                                item.status == "running" &&
                                item.cron &&
                                (!item.start_time || (moment().isAfter(moment(item.start_time)))) &&
                                (!item.end_time || (moment().isBefore(moment(item.end_time))))
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
        checkTask(id) {
            return id && this.task_list[this.getTaskId(id)]
        },
        /**
         * 运行任务
         * @param {*} id 
         */
        Run: function (item) {
            let self = this;
            let task_id = this.getTaskId(item.task_id);

            let job_rule = { rule: item.cron };
            if (item.start_time) {
                job_rule.start = item.start_time;
            }
            if (item.end_time) {
                job_rule.end = item.end_time;
            }

            let job = schedule.scheduleJob(task_id, job_rule, function () {

                let task_log = self.getLogItem(item.task_id, job);
                task_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
                task_log.content = job.name;
                self.saveLog(task_log)
            });

            let create_log = self.getLogItem(item.task_id, job);
            create_log.end_time = moment().format("YYYY-MM-DD HH:mm:ss");
            create_log.content = "创建任务";
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
            if (this.checkTask(id)) {
                this.task_list[task_id].reschedule(spec)
            }
        },
        ReStart: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTask(id)) {
                this.task_list[task_id].cancel(true);
            }
        },
        /**
         * 取消任务
         * @param {*} id 
         */
        Cancel: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTask(id)) {
                this.task_list[task_id].cancel();
            }
        },
        /**
         * 取消最近一次的执行任务
         * @param {*} id 
         */
        CancelNext: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTask(id)) {
                this.task_list[task_id].cancelNext(true);
            }
        },
        /**
         * 取消任务并从列表中移除
         * @param {*} id 
         */
        Remove: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTask(id)) {
                this.task_list[task_id].cancel();
                delete this.task_list[task_id]
            }
        },
        getLogItem: function (task_id, job) {
            return {
                task_id,
                start_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                next_time: job.nextInvocation() ? moment(job.nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss") : null,
                content: job.name

            }
        },
        saveLog: function (data) {
            this.db.SystemTaskLog.build(data).save();
        }
    }

    TaskMgr.init();

    return TaskMgr;
}