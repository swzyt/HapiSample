var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Guid = require('guid');
var Service = function (db) {
    this.db = db;
    this.include = [{
        model: this.db.NetPayProject,
        as: 'project'
    }, {
        model: this.db.NetPayBuilding,
        as: 'building'
    }];
    this.attributes = ['room_id', 'name', 'full_name', 'floor', 'unit', 'valid', 'created_at', 'updated_at', 'project_id', 'building_id'];
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
    return this.db.NetPayRoom.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.NetPayRoom.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.NetPayRoom.build(data).save().then(result => {
        if (result) {
            result = JSON.parse(JSON.stringify(result))
            delete result.secret//删除secret后返回
        }

        return result
    });
};
//删除单个
Service.prototype.delete = function (where) {

    return this.db.NetPayRoom.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = function (where, data) {
    return this.db.NetPayRoom.update(data, { where: where });
};

module.exports = Service;

