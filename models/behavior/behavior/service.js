var _ = require('lodash');
var moment = require("moment");
var Service = function (db) {
    this.db = db;
    this.attributes = ['behavior_id', 'action', 'ip_address', 'description', 'lat', 'lng', 'operator_type', 'operator_id', 'business_type', 'business_name', 'SESSION_ID', 'created_at', 'updated_at', 'create_user_name', 'update_user_name'];
};

Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        attributes: this.attributes,
        where: where,
        order: orderArr
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.Behavior.findAndCountAll(options)
};

Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.Behavior.findOne(option);
};

Service.prototype.create = function (data) {

    var self = this;

    return self.db.Behavior.build(data).save();
};

Service.prototype.delete = function (where) {

    return this.db.Behavior.findOne({ where: where }).then(function (item) {
        return item.destroy();
    });
};

Service.prototype.update = function (where, data) {
    return this.db.Behavior.update(data, { where: where });
};

module.exports = Service;

