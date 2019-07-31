var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Service = function (db) {
    this.db = db;
    this.attributes = ['task_id', 'name', 'type', 'method', 'valid', 'status', 'start_time', 'end_time', 'cron', 'description', 'created_at', 'updated_at'];

    this.include = [
        {
            //任务日志
            model: this.db.SystemTaskLog,
            as: "logs",
            required: false
        }
    ]
};
//普通列表
Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        attributes: this.attributes,
        include: this.include,
        where: where,
        order: orderArr
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.SystemTask.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.SystemTask.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.SystemTask.build(data).save()
};
//删除单个
Service.prototype.delete = function (where) {

    //删除角色
    this.db.SystemTaskRole.destroy({ where: where })

    return this.db.SystemTask.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//删除批量
Service.prototype.delete_batch = function (where) {
    //删除角色
    this.db.SystemTaskRole.destroy({ where: where })

    return this.db.SystemTask.destroy({ where: where })
};
//更新单个
Service.prototype.update = function (where, data) {

    var self = this;

    return self.db.SystemTask.update(data, { where: where })
};
//更新批量
Service.prototype.update_batch = function (where, data) {
    return this.db.SystemTask.update(data, { where: where });
};

module.exports = Service;