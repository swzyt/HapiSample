var Joi = require('joi');
var Boom = require('boom');
var JWT = require('jsonwebtoken');
var settings = require("../../settings");
var jwt_token = require("../../libs/jwt/index");

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
                            menus: Joi.array().required().description('菜单信息'),
                            token: Joi.object().required().description('访问令牌、过期时间')
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

                            //获取用户菜单及按钮权限
                            let menu_option = {
                                include: [{
                                    //菜单按钮
                                    model: db.SystemMenuButton,
                                    as: "buttons",
                                    required: false
                                },],
                                where: { valid: true },
                                order: [['parent_id', 'asc'], ['sort', 'asc']]
                            };
                            let role_permission_option = {
                                where: { role_id: { $in: user.roles.map(item => { return item.role_id }) } }
                            };
                            let menu_button_options = {
                                where: { valid: true },
                            };
                            return Promise.all([
                                db.SystemMenu.findAll(menu_option),
                                db.SystemRolePermission.findAll(role_permission_option),
                                db.SystemButton.findAll(menu_button_options),
                            ]).then(system_data => {
                                system_data = JSON.parse(JSON.stringify(system_data));
                                let menus = system_data[0],
                                    role_permissions = system_data[1],
                                    buttons = system_data[2];

                                let last_result = menus.filter(x => {
                                    //检测菜单权限
                                    return role_permissions.filter(y => {
                                        return y.permission_type == "menu" && y.permission_id == x.menu_id
                                    }).length > 0
                                }).map(x => {
                                    //仅返回需要的属性
                                    x = {
                                        menu_id: x.menu_id,
                                        name: x.name,
                                        icon: x.icon,
                                        path: x.path,
                                        target: x.target == '_blank' ? x.target : null,
                                        hideInMenu: !x.is_show,
                                        buttons: x.buttons,
                                        parent_id: x.parent_id
                                    }
                                    //检测按钮权限
                                    x.buttons = x.buttons
                                        .filter(z => {
                                            return role_permissions.filter(y => {
                                                return y.permission_type == "menu_button" && y.permission_id == z.menu_button_id
                                            }).length > 0;
                                        })
                                        .map(z => {
                                            //按钮信息处理
                                            let button = buttons.filter(item => {
                                                return item.button_id == z.button_id;
                                            })
                                            if (button && button.length > 0) {
                                                return button[0].code;
                                                // return { code: button[0].code, name: button[0].name }
                                            }
                                            return null;
                                        })
                                        .filter(z => {
                                            return z;
                                        })
                                    return x;
                                })

                                var data = {
                                    app,
                                    user,
                                    menus: last_result,// treeData(last_result, 'menu_id', 'parent_id', 'routes'),
                                    token: {
                                        //按配置设置过期时间
                                        expires_at: new Date().getTime() + settings.jwt.expire_times * 1000
                                    }
                                };
                                let gid = jwt_token.getTokenGuid();
                                //sign the session as a JWT
                                data.token.value = JWT.sign(gid, settings.jwt.secret) // synchronous
                                //写入redis
                                jwt_token.setToken(gid, data, data.token.expires_at);

                                return h.success(data);
                            })
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