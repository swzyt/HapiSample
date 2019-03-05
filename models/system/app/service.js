var Service = function (db) {
    this.db = db;
    this.attributes = ['app_id', 'name', 'secret', 'description', 'created_at', 'updated_at'];
};

Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        attributes: this.attributes,
        where: where,
        order: orderArr || [['updated_at', 'desc']]
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.SystemApp.findAndCountAll(options)
};

Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.SystemApp.findOne(option);
};

Service.prototype.create = function (data) {

    var self = this;

    return self.db.SystemApp.build(data).save();
};

Service.prototype.delete = function (where) {

    return this.db.SystemApp.findOne({ where: where }).then(function (item) {
        return item.destroy();
    });
};

Service.prototype.update = function (where, data) {
    return this.db.SystemApp.update(data, { where: where });
};

module.exports = Service;

