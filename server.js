const Hapi = require('hapi');

module.exports = function (serverConfig, bootstrap) {

    var Server = new Hapi.Server({
        host: serverConfig.host,
        port: serverConfig.port,
        routes: {
            cors: {
                origin: ['*'],//跨域
                //additionalHeaders: ["Accept-Language", "Corporation-Id", "U", "T", "Sign"]
            }
        }
    });

    const reply_send = function (data) {
        if (data instanceof Object) {
            if (data.hasOwnProperty('total') && data.hasOwnProperty('items')) {
                return this.response({ code: 200, message: "OK", total: data.total, data: data.items });
            } else {
                if (data.toJSON) {
                    return this.response({ code: 200, message: "OK", data: data.toJSON() });
                } else {
                    return this.response({ code: 200, message: "OK", data: data });
                }
            }
        }
        return this.response({ code: 200, message: "OK" });
    };

    const reply_error = function (boom) {
        return this.response({ code: boom.output.statusCode, message: boom.output.payload.message }).code(boom.output.statusCode);
    };

    //增加扩展方法
    Server.decorate('toolkit', 'success', reply_send);
    Server.decorate('toolkit', 'error', reply_error);

    //插件注册
    Server.register([
        require('inert'),
        require('vision'),
        {
            plugin: require('hapi-swagger'),
            options: {
                info: {
                    title: 'HapiSimple 接口文档',
                    version: "1.0.0",
                },
            }
        }/* , {
            plugin: require('hapi-pino'),
            options: {
                prettyPrint: true, // 格式化输出
                //prettyPrint: false,
                logEvents: ['response']
            }
        } */
    ]);

    //生命周期事件
    Server.ext('onRequest', function (request, h) {
        console.log('onRequest')
        request.headers['x-req-start'] = (new Date()).getTime();
        return h.continue;
    });

    Server.ext('onPostAuth', function (request, h) {
        console.log('onPostAuth')

        return h.continue;
        //return h.error(Boom.badData("非法请求"));
    });

    Server.ext('onPreResponse', function (request, h) {
        console.log('onPreResponse')
        var start = parseInt(request.headers['x-req-start']);
        var end = (new Date()).getTime();

        const response = request.response;

        if (response.output) {
            response.output.headers['x-req-start'] = "1.0.0";
            response.output.headers['x-bm-api-id'] = request.id;
            response.output.headers['x-bm-req-start'] = start;
            response.output.headers['x-bm-res-end'] = end;
            response.output.headers['x-bm-response-time'] = end - start;
        }
        else {
            response.headers['x-req-start'] = "1.0.0";
            response.headers['x-bm-api-id'] = request.id;
            response.headers['x-bm-req-start'] = start;
            response.headers['x-bm-res-end'] = end;
            response.headers['x-bm-response-time'] = end - start;
        }

        //request.logger.info('In handler %s', request.path);

        return h.continue;
    });

    Server.ext('onPreHandler', function (request, h) {
        console.log('onPreHandler')
        return h.continue;
    });

    return Server;
};