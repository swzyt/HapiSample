
const _ = require('lodash');
const multiparty = require('multiparty');

const mongo_db = require("../mongodb");

/**
 * 生成日志对象
 * @param {*} request 
 */
const getLogItem = async (request) => {

    if (request.path.indexOf("/storage/files/upload") > -1 && request.payload) {
        //转换payload
        var form = new multiparty.Form();

        return new Promise((resolve, reject) => {
            form.parse(request.payload, function (err, fields, files) {
                return resolve(makeLog({ err, fields, files }));
            })
        })
    }
    else {
        return makeLog();
    }

    function makeLog(body) {
        var item = {
            req_id: request.response.headers['req-id'],
            req_start: request.response.headers['req-start'],
            res_end: request.response.headers['res-end'],
            req_res_span_time: request.response.headers['req-res-span-time'],
            path: request.path,
            method: request.method,
            request: {
                headers: request.headers,
                query: request.query,
                body: body || (request.payload || null)
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
            if (_.isArray(request.response.source)) {
                var data = _.isFunction(request.response.source.toJSON) ?
                    request.response.source.toJSON() : request.response.source;
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

        item.request = JSON.stringify(item.request)
        item.response = JSON.stringify(item.response)

        return item;
    }

}

module.exports = async (request, db, settings) => {

    const api_log_setting = settings.api_log,
        db_name = settings.mongodb.dbname,
        collection_name = settings.mongodb.tableName_api_log;

    if (api_log_setting.on_off) {
        let log_item = await getLogItem(request)

        //mongo日志
        if (api_log_setting.db && api_log_setting.db.mongo) {
            mongo_db.insertOne(db_name, collection_name, log_item, (err) => {
                console.log("api_log_mongo:", JSON.stringify(err))
            })
        }

        //mysql日志
        if (api_log_setting.db && api_log_setting.db.mysql) {
            db.SystemApiLog.build(log_item).save();
        }
    }

}