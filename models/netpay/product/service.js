var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Guid = require('guid');
var Service = function (db) {
    this.db = db;
    this.include = [];
    this.attributes = ['product_id', 'name', 'product_type', 'logo_url', 'banner_imgs', 'poster_bg_url', 'begin_valid_time', 'end_valid_time', 'unit_name', 'description', 'valid', 'base_price', 'mark_price', 'installation_fee', 'optical_modem_deposit', 'operator_cost', 'owner_sharing', 'created_at', 'updated_at'];
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
    return this.db.NetPayProduct.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.NetPayProduct.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.NetPayProduct.build(data).save().then(result => {
        if (result) {
            result = JSON.parse(JSON.stringify(result))
            delete result.secret//删除secret后返回
        }

        return result
    });
};
//删除单个
Service.prototype.delete = function (where) {

    return this.db.NetPayProduct.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = function (where, data) {
    return this.db.NetPayProduct.update(data, { where: where });
};

module.exports = Service;

