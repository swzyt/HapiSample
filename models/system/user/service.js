var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Service = function (db) {
    this.db = db;
    this.attributes = ['user_id', 'account', 'name', 'email', /* 'password',  */'description', 'valid', 'created_at', 'updated_at'];
};
//普通列表
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
    return this.db.SystemUser.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.SystemUser.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    //生成密码，默认123456
    if (!data.password) {
        data.password = "123456"
    }

    return self.db.SystemUser.build(data).save().then(result => {
        if (result) {
            result = JSON.parse(JSON.stringify(result))
            delete result.password//删除密码后返回
        }

        return result
    });
};
//删除单个
Service.prototype.delete = function (where) {

    return this.db.SystemUser.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//删除批量
Service.prototype.delete_batch = function (where) {
    return this.db.SystemUser.destroy({ where: where })
};
//更新单个
Service.prototype.update = function (where, data) {
    return this.db.SystemUser.update(data, { where: where });
};
//更新批量
Service.prototype.update_batch = function (where, data) {
    return this.db.SystemUser.update(data, { where: where });
};

module.exports = Service;