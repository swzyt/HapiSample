const Hapi = require('hapi');

module.exports = function (settings, bootstrap) {

    var Server = new Hapi.Server({
        host: settings.server.host,
        port: settings.server.port,
        routes: {
            cors: {
                origin: ['*'],//跨域
                //additionalHeaders: ["Accept-Language", "Corporation-Id", "U", "T", "Sign"]
            }
        }
    });

    const reply_send = function (data) {
        if (data instanceof Object) {
            data = JSON.stringify(data)
            data = JSON.parse(data)
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
    let pluginsArray = [
        require('hapi-auth-jwt2'),//json web token 验证插件
        require('inert'),
        require('vision'),
        {
            plugin: require('hapi-swagger'),//api文档插件
            options: {
                lang: "zh-cn",//中文显示
                tags: [
                    { "name": "jwt", "description": "JSON WEB TOKEN" },//此处配置各模块描述内容
                    { "name": "system", "description": "系统设置" }
                ],
                info: {
                    title: 'HapiSimple 接口文档',
                    version: "1.0.0",
                },
                securityDefinitions: {//api文档头部输入token，以便测试
                    'jwt': {
                        'type': 'apiKey',
                        'name': 'Authorization',
                        'in': 'header'
                    }
                },
                security: [{ 'jwt': [] }],
                auth: false
            }
        },/* {
            plugin: require('hapi-pino'),
            options: {
                prettyPrint: true, // 格式化输出
                //prettyPrint: false,
                logEvents: ['response']
            }
        } */
    ]
    Server.register(pluginsArray);

    //jwt认证自定义方法
    var validate = function (decoded, request) {

        //此处可验证当前接口请求人与token拥有着是否一致，且token是否在有效期内
        //目前只验证了token有效期

        //可根据来源域名判断是否需要检测接口请求人，例如，api文档内的请求只判断有效期

        return { isValid: decoded.expiresAt > new Date().getTime() };
    };
    Server.auth.strategy('jwt', 'jwt',
        {
            key: settings.jwt.secret,          // Never Share your secret key
            validate: validate,            // validate function defined above
            verifyOptions: { algorithms: ['HS256'] } // pick a strong algorithm
        });
    Server.auth.default('jwt');

    //生命周期事件
    Server.ext('onRequest', function (request, h) {
        console.log('onRequest')
        request.headers['c-req-start'] = (new Date()).getTime();//设置请求开始时间

        return h.continue;
    });

    Server.ext('onPostAuth', function (request, h) {
        console.log('onPostAuth')

        return h.continue;
        //return h.error(Boom.badData("非法请求"));
    });

    Server.ext('onPreResponse', function (request, h) {
        console.log('onPreResponse')
        var start = parseInt(request.headers['c-req-start']);
        var end = (new Date()).getTime();

        const response = request.response;

        if (response.headers) {
            response.headers['c-api-version'] = "1.0.0";
            response.headers['c-req-id'] = request.id;
            response.headers['c-req-start'] = start;
            response.headers['c-res-end'] = end;
            response.headers['c-req-res-time'] = end - start;
        }

        return h.continue;
    });

    Server.ext('onPreHandler', function (request, h) {
        console.log('onPreHandler')
        return h.continue;
    });

    return Server;
};