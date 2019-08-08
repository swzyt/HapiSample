var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Service = function (db) {
    this.db = db;
    this.attributes = ['task_id', 'name', 'type', 'method', 'path', 'params', 'process_number', 'parallel_number', 'run_limit', 'valid', 'status', 'start_time', 'end_time', 'cron', 'description', 'created_at', 'updated_at'];

    this.include = [{
        //任务日志
        model: this.db.SystemTaskLog,
        as: "logs",
        required: false
    }, {
        //任务进程
        model: this.db.SystemTaskProcess,
        as: "processs",
        required: false
    }]

    //初始化任务
    this.TaskMgr = require("../../../libs/TaskMgr")(db);
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
        self.TaskMgr.startSingle(item);

        return item;
    })
};
//删除单个
Service.prototype.delete = function (where) {
    let self = this;

    return self.db.SystemTask.findOne({ where: where }).then(async function (item) {
        if (item) {

            // 先清除单项任务Redis
            await self.TaskMgr.clearRedisSingle(item.task_id);

            // 取消并删除
            await self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.CANCELSINGLE, item.task_id);

            return item.destroy();
        }
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = async function (where, data) {

    var self = this;

    // 先清除单项任务Redis
    await self.TaskMgr.clearRedisSingle(item.task_id);
    // 先取消并删除
    await self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.CANCELSINGLE, where.task_id);

    return self.db.SystemTask.update(data, { where: where }).then(result => {

        self.get(where).then(item => {
            // 重启任务
            self.TaskMgr.startSingle(item);
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

    //清除Redis
    await self.TaskMgr.clearRedisAll();

    return await self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.STOPALL);
};

Service.prototype.syncTaskProcess = async function () {

    var self = this;

    //删除所有进程记录
    await self.db.SystemTaskProcess.destroy({ where: { process_id: { $gt: 0 } } })

    return await self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.SYNCTASKPROCESS);
};


module.exports = Service;