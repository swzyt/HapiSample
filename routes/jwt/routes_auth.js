var Joi = require('joi');
var Boom = require('boom');
var aguid = require('aguid');
var JWT = require('jsonwebtoken');
var settings = require("../../settings")
module.exports = function (server, models, oauth, db) {

    server.route([
        {
            method: ['GET'],
            path: '/jwt/auth',
            config: {
                auth: false,
                tags: ['api'],
                description: '根据app_id和app_secret获取授权',
                notes: '根据app_id和app_secret获取授',
                validate: {
                    query: {
                        app_id: Joi.string().required().description('app_id'),
                        app_secret: Joi.string().required().description('app_secret')
                    }
                },
                response: {
                    schema: Joi.object({
                        code: Joi.number().integer().description("返回代码"),
                        message: Joi.string().description('返回信息'),
                        data: Joi.object({
                            app_id: Joi.string().required().description('应用标识'),
                            expiresAt: Joi.number().integer().required().description('过期时间(时间戳)'),
                            token: Joi.string().required().description('访问令牌')
                        }).meta({ className: "GetResponseData" }).allow(null).description("信息")
                    }).meta({ className: "GetResponse" }).required().description("返回消息体")
                },
                handler: function (request, h) {
                    let app_id = request.query.app_id;
                    let app_secret = request.query.app_secret;

                    //此处验证账户id和secret是否正确
                    var option = {
                        where: {
                            app_id: app_id,
                            secret: app_secret
                        }
                    };

                    return db.SystemApp.findOne(option).then(item => {
                        if (!item) return h.error(Boom.badRequest("app_id或app_secret无效"));

                        var tokens = {
                            app_id: app_id,
                            expiresAt: new Date().getTime() + settings.jwt.expire_times * 1000//按配置设置过期时间
                        }

                        //sign the session as a JWT
                        tokens.token = JWT.sign(tokens, settings.jwt.secret); // synchronous

                        return h.success(tokens);
                    });
                }
            }
        }
    ])
};