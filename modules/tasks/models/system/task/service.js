var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Service = function (db) {
    this.db = db;
    this.attributes = ['task_id', 'name', 'type', 'method', 'path', 'params', 'process_number', 'parallel_number', 'run_limit', 'valid', 'status', 'start_time', 'end_time', 'cron', 'description', 'created_at', 'updated_at',
        [this.db.sequelize.literal(`(select count(stp.task_process_id) from system_task_processs stp where stp.task_id = \`SystemTask\`.task_id )`), 'curr_process_count'],//当前任务运行进程数量 
        [this.db.sequelize.literal(`(select sum(stp.queue_length) from system_task_processs stp where stp.task_id = \`SystemTask\`.task_id )`), 'queue_length'],//当前任务待运行队列数
        [this.db.sequelize.literal(`(select count(stl.task_log_id) from system_task_logs stl where stl.task_id = \`SystemTask\`.task_id and stl.log_type = 'RUN' )`), 'run_log_count'],//运行日志数 
        [this.db.sequelize.literal(`(select count(stl.task_log_id) from system_task_logs stl where stl.task_id = \`SystemTask\`.task_id and stl.log_type = 'START_CANCEL' )`), 'startcancel_log_count'],//启停日志数
    ];

    this.include = [/* {
        //任务日志
        model: this.db.SystemTaskLog,
        as: "logs",
        required: false
    }, {
        //任务进程
        model: this.db.SystemTaskProcess,
        as: "processs",
        required: false
    } */]

    //初始化任务管理模块
    let TaskMgr = require("../../../libs/TaskMgr");
    this.TaskMgr = new TaskMgr(db);
};

//普通列表
Service.prototype.list = function (where, page_size, page_number, orderArr) {
    let self = this;

    var options = {
        distinct: true,
        attributes: self.attributes,
        include: self.include,
        where: where,
        order: orderArr
    };

    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }

    return self.db.SystemTask.findAndCountAll(options)
};
//普通列表
Service.prototype.loglist = function (where, page_size, page_number, orderArr) {
    let self = this;

    var options = {
        distinct: true,
        include: [{
            //任务对象
            model: this.db.SystemTask,
            as: "task",
            required: true
        }],
        where: where,
        order: orderArr
    };

    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }

    return self.db.SystemTaskLog.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        attributes: this.attributes,
        include: this.include,
        where: where,
    };

    return this.db.SystemTask.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    let self = this;

    return self.db.SystemTask.build(data).save().then((item) => {

        // 启动任务
        self.TaskMgr.createTask(item);

        return item;
    })
};
//删除单个
Service.prototype.delete = function (where) {
    let self = this;

    return self.db.SystemTask.findOne({ where: where }).then(async function (item) {
        if (item) {

            await self.TaskMgr.Cancel(item.task_id);

            return item.destroy();
        }
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = async function (where, data) {

    var self = this;

    await self.TaskMgr.Cancel(where.task_id);

    return self.db.SystemTask.update(data, { where: where }).then(result => {

        self.get(where).then(item => {
            // 重启任务
            self.TaskMgr.createTask(item);
        })

        return result;
    })
};

Service.prototype.initRedisAll = async function () {

    var self = this;

    return await self.TaskMgr.initRedisAll();
};

Service.prototype.clearRedisAll = async function () {

    var self = this;

    return await self.TaskMgr.clearRedisAll();
};

Service.prototype.startAll = async function () {

    var self = this;

    //初始化Redis
    await self.TaskMgr.initRedisAll();

    return await self.TaskMgr.startAll();
};

Service.prototype.stopAll = async function () {

    var self = this;

    return await self.TaskMgr.stopAll();
};


module.exports = Service;