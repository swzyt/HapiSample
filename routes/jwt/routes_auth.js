var Joi = require('joi');
var aguid = require('aguid');
var JWT = require('jsonwebtoken');
var settings = require("../../settings")
module.exports = function (server, models) {

    server.route([
        {
            method: ['GET'],
            path: '/jwt/auth',
            config: {
                auth: false,
                tags: ['api'],
                description: '根据app_id和app_secret获取授权',
                notes: '根据app_id和app_secret获取授',
                handler: function (request, h) {
                    let app_id = 1;//request.query.app_id;
                    let app_secret = 'secret'; //request.query.app_secret;

                    //TODO:此处验证账户id和secret是否有效

                    var tokens = {
                        app_id: app_id,
                        expiresAt: new Date().getTime() + settings.jwt.expire_times * 1000//按配置设置过期时间
                    }

                    //sign the session as a JWT
                    tokens.token = JWT.sign(tokens, settings.jwt.secret); // synchronous

                    return tokens;
                }
            }
        }
    ])
};