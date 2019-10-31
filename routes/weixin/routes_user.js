var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.weixin.user.controller);

    server.route([
        {
            method: 'GET',
            path: '/weixin/users',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '分页方式获取微信用户列表信息',
                validate: models.weixin.user.validator.list.request,
                notes: '分页方式获取微信用户列表信息',
                response: models.weixin.user.validator.list.response,
                handler: models.weixin.user.controller.list
            }
        },
        {
            method: 'POST',
            path: '/weixin/users',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '创建新的微信用户信息',
                validate: models.weixin.user.validator.create.request,
                notes: 'My route notes',
                response: models.weixin.user.validator.create.response,
                handler: models.weixin.user.controller.create
            }
        },
        {
            method: 'GET',
            path: '/weixin/users/{user_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '获取指定标识的微信用户信息',
                validate: models.weixin.user.validator.get.request,
                notes: 'My route notes',
                response: models.weixin.user.validator.get.response,
                handler: models.weixin.user.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/weixin/users/{user_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '更新指定标识的微信用户信息',
                validate: models.weixin.user.validator.put.request,
                notes: 'My route notes',
                response: models.weixin.user.validator.put.response,
                handler: models.weixin.user.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/weixin/users/{user_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '删除指定标识的微信用户信息',
                validate: models.weixin.user.validator.delete.request,
                notes: 'My route notes',
                response: models.weixin.user.validator.delete.response,
                handler: models.weixin.user.controller.delete
            }
        },

        {
            method: 'GET',
            path: '/weixin/sessionkey2',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '获取微信小程序session_key',
                notes: 'My route notes',
                handler: models.weixin.user.controller.getSessionKey2
            }
        },
        {
            method: 'POST',
            path: '/weixin/decryptuserinfo2',
            config: {
                auth: 'jwt',
                tags: ['api', 'weixin-user'],
                description: '解密微信小程序用户信息',
                notes: 'My route notes',
                handler: models.weixin.user.controller.DecryptMimiAppUser2
            }
        },
    ])
};