var Joi = require('joi');
var Boom = require('boom');
var JWT = require('jsonwebtoken');
var settings = require("../../../../settings")

module.exports = function (server, models, oauth, db) {

    server.route([
        {
            method: ['POST'],
            path: '/jwt/auth',
            config: {
                auth: false,
                tags: ['api', 'auth'],
                description: '根据app_id、app_secret及用户账号密码 获取授权',
                notes: '根据app_id、app_secret及用户账号密码 获取授权',
                validate: {
                    payload: {
                        app_id: Joi.string().required().description('app_id'),
                        app_secret: Joi.string().required().description('app_secret'),
                        user_account: Joi.string().required().description('用户账号'),
                        user_password: Joi.string().required().description('用户密码')
                    }
                },
                response: {
                    schema: Joi.object({
                        code: Joi.number().integer().description("返回代码"),
                        message: Joi.string().description('返回信息'),
                        data: Joi.object({
                            app: Joi.object().required().description('应用信息'),
                            user: Joi.object().required().description('用户信息'),
                            expiresAt: Joi.number().integer().required().description('过期时间(时间戳)'),
                            token: Joi.string().required().description('访问令牌')
                        }).meta({ className: "GetResponseData" }).allow(null).description("信息")
                    }).meta({ className: "GetResponse" }).required().description("返回消息体")
                },
                handler: function (request, h) {
                    let app_id = request.payload.app_id;
                    let app_secret = request.payload.app_secret;
                    let user_account = request.payload.user_account;
                    let user_password = request.payload.user_password;

                    if (!(app_id && app_secret && user_account && user_password)) {
                        return h.error(Boom.badRequest("参数有误"));
                    }

                    //此处验证app id和secret是否正确
                    var app_option = {
                        attributes: ['app_id', 'name', 'description', 'valid'],
                        where: {
                            app_id: app_id,
                            secret: app_secret
                        }
                    };
                    //此处验证user account和password是否正确
                    var user_option = {
                        attributes: ['user_id', 'account', 'name', 'email', 'description', 'valid'],
                        include: [{
                            //用户角色
                            model: db.SystemUserRole,
                            as: "roles",
                            required: false
                        }],
                        where: {
                            account: user_account,
                            password: user_password
                        }
                    };
                    return Promise.all([
                        db.SystemApp.findOne(app_option),
                        db.SystemUser.findOne(user_option)
                    ]).then(results => {
                        if (results && results.length == 2) {
                            let app = results[0], user = results[1];

                            if (!app) {
                                return h.error(Boom.badRequest("app_id或app_secret 有误"));
                            }
                            if (!user) {
                                return h.error(Boom.badRequest("user_account或user_password 有误"));
                            }
                            if (app && !app.valid) {
                                return h.error(Boom.badRequest("app已被禁用"));
                            }
                            if (user && !user.valid) {
                                return h.error(Boom.badRequest("账号已被禁用"));
                            }

                            var tokens = {
                                app,
                                user,
                                //按配置设置过期时间
                                expiresAt: new Date().getTime() + settings.jwt.expire_times * 1000
                            }
                            //sign the session as a JWT
                            tokens.token = JWT.sign(tokens, settings.jwt.secret) // synchronous

                            return h.success(tokens);
                        }
                        else {
                            return h.error(Boom.badRequest("app_id、app_secret、user_account或user_password 有误"));
                        }
                    })
                }
            }
        }
    ])
};