const schedule = require("node-schedule");
const moment = require("moment");

module.exports = function (list) {
    var TaskMgr = {

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
        Run: function (id) {
            let task_id = this.getTaskId(id);
            let rule = new schedule.RecurrenceRule();
            rule.second = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56];

            let job = schedule.scheduleJob(task_id, rule, function () {
                console.log(task_id, moment().format("YYYY-MM-DD HH:mm:ss"), moment(job.nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss"))
            });

            this.task_list[task_id] = job;
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
        /**
         * 获取下次运行时间
         * @param {*} id 
         */
        NextInvocation: function (id) {
            let task_id = this.getTaskId(id);
            if (this.checkTask(id)) {
                moment(this.task_list[task_id].nextInvocation().getTime()).format("YYYY-MM-DD HH:mm:ss")
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
        }
    }

    if (list && list.length > 0) {
        list.map(item => {
            TaskMgr.Run(item)
        })
    }

    return TaskMgr;
}