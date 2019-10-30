var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Guid = require('guid');
var Service = function (db) {
    this.db = db;
    this.include = [];
    this.attributes = ['operator_id', 'name', 'line_number', 'contact_name', 'contact_mobile', 'address', 'description', 'valid', 'created_at', 'updated_at'];
};
//普通列表
Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        attributes: this.attributes,
        include: _.cloneDeep(this.include),
        where: where,
        order: orderArr
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.NetPayOperator.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.NetPayOperator.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.NetPayOperator.build(data).save();
};
//删除单个
Service.prototype.delete = function (where) {

    return this.db.NetPayOperator.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = function (where, data) {
    return this.db.NetPayOperator.update(data, { where: where });
};

module.exports = Service;

