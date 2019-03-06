const _ = require('lodash');

const mongo_db = require("../mongodb");

const db_name = 'hapi_log', collection_name = 'api_log';

exports.findOne = function (item, callback) {
    mongo_db.findOne(db_name, collection_name, item, callback)
}

exports.find = function (item, callback) {
    mongo_db.find(db_name, collection_name, item, callback)
}

exports.insertOne = function (request, callback) {

    var start = parseInt(request.headers['c-req-start']);
    var end = (new Date()).getTime();

    var item = {
        id: request.info.id,
        start: start,
        end: end,
        response_time: end - start,
        path: request.path,
        method: request.method,
        request: {
            headers: request.headers,
            query: request.query,
            body: request.payload
        },
        response: {
            headers: request.response.headers || undefined,
        }
    }
    if (request.response.source) {
        if (_.isInteger(request.response.source.code))
            item.response.code = request.response.source.code;

        if (_.isString(request.response.source.message))
            item.response.message = request.response.source.message;

        if (_.isInteger(request.response.source.total))
            item.response.total = request.response.source.total;

        if (_.isObject(request.response.source.data)) {
            var data = _.isFunction(request.response.source.data.toJSON) ?
                request.response.source.data.toJSON() : request.response.source.data;
            item.response.data = data
        }
    }

    if (request.response.isBoom && request.response.name && request.response.message) {
        item.response.headers = item.response.headers || (request.response.output.headers || undefined)

        if (_.isInteger(request.response.output.statusCode))
            item.response.code = request.response.output.statusCode;

        if (_.isString(request.response.name) && _.isString(request.response.message))
            item.response.message = request.response.name + ' - ' + request.response.message;
    }

    if (_.isObject(request.filter)) {
        item.app_id = request.filter.app_id;
    }

    item.ip = request.info.remoteAddress;

    mongo_db.insertOne(db_name, collection_name, item, callback)
}