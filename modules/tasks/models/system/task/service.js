var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Service = function (db) {
    this.db = db;
    this.attributes = ['task_id', 'name', 'type', 'method', 'path', 'process_number', 'parallel_number', 'valid', 'status', 'start_time', 'end_time', 'cron', 'description', 'created_at', 'updated_at'];

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

    return self.db.SystemTask.build(data).save().then(item => {

        //初始化任务
        // self.TaskMgr.Run(item)
        self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.RESTARTSINGLE, item.toJSON());

        return item
    })
};
//删除单个
Service.prototype.delete = function (where) {
    let self = this;

    return self.db.SystemTask.findOne({ where: where }).then(function (item) {
        if (item) {

            // 取消并删除
            self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.CANCELSINGLE, item.task_id);

            return item.destroy();
        }
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = function (where, data) {

    var self = this;

    return self.db.SystemTask.update(data, { where: where }).then(result => {

        self.get(where).then(item => {
            // 重启任务
            self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.RESTARTSINGLE, item.toJSON());
        })

        return result;
    })
};

Service.prototype.initRedis = function () {

    var self = this;

    self.TaskMgr.initRedis();

    return null;
};

Service.prototype.clearRedis = function () {

    var self = this;

    self.TaskMgr.clearRedis();

    return null;
};

Service.prototype.startAll = function () {

    var self = this;

    self.TaskMgr.initRedis().then(() => {
        self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.STARTALL);
    })

    return null;
};

Service.prototype.stopAll = function () {

    var self = this;

    self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.STOPALL);

    return null;
};

Service.prototype.syncTaskProcess = function () {

    var self = this;

    self.TaskMgr.pubRedisChannel(self.TaskMgr.RedisChannelKey.SYNCTASKPROCESS);

    return null;
};


module.exports = Service;