var Boom = require('boom');

var Controller = function (service) {
    this.service = service;
};

Controller.prototype.list = function (request, h) {

    var where = {};

    return this.service.list(where, request.query.page_size, request.query.page_number, [['created_at', 'desc']]).then(function (list) {
        return h.success({ total: list.count, items: list.rows });
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};

Controller.prototype.get = function (request, h) {

    var where = { app_id: request.params.app_id };

    return this.service.get(where).then(function (row) {

        if (!row) return h.error(Boom.badRequest("找不到指定标识的数据"));

        var item = row.get();
        return h.success(item);

    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};

Controller.prototype.create = function (request, h) {

    if (request.payload && JSON.stringify(request.payload) != "{}") {
        return this.service.create(request.payload).then(function (result) {
            return h.success();
        }).catch(function (err) {
            return h.error(Boom.badRequest(err.message, err));
        })
    }
    else {
        return h.error(Boom.badRequest("消息体不能为空"));
    }
};

Controller.prototype.delete = function (request, h) {

    var where = { app_id: request.params.app_id };

    return this.service.delete(where).then(function (row) {
        return h.success();
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};

Controller.prototype.update = function (request, h) {

    var where = { app_id: request.params.app_id };

    return this.service.update(where, request.payload).then(function (result) {
        return h.success();
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};

module.exports = Controller;