var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.system.user.controller);

    server.route([
        {
            method: 'GET',
            path: '/system/users',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '分页方式获取用户列表信息',
                validate: models.system.user.validator.list.request,
                notes: '分页方式获取用户列表信息',
                response: models.system.user.validator.list.response,
                handler: models.system.user.controller.list
            }
        },
        {
            method: 'POST',
            path: '/system/users',
            config: {
                auth: false,
                tags: ['api'],
                description: '创建新的用户信息',
                validate: models.system.user.validator.create.request,
                notes: 'My route notes',
                response: models.system.user.validator.create.response,
                handler: models.system.user.controller.create
            }
        },
        {
            method: 'GET',
            path: '/system/users/{user_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '获取指定标识的用户信息',
                validate: models.system.user.validator.get.request,
                notes: 'My route notes',
                response: models.system.user.validator.get.response,
                handler: models.system.user.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/system/users/{user_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '更新指定标识的用户信息',
                validate: models.system.user.validator.put.request,
                notes: 'My route notes',
                response: models.system.user.validator.put.response,
                handler: models.system.user.controller.update
            }
        },
        {
            method: 'PUT',
            path: '/system/users/update_batch',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '更新批量',
                validate: models.system.user.validator.update_batch.request,
                notes: 'My route notes',
                response: models.system.user.validator.update_batch.response,
                handler: models.system.user.controller.update_batch
            }
        },
        {
            method: 'DELETE',
            path: '/system/users/{user_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '删除指定标识的用户信息',
                validate: models.system.user.validator.delete.request,
                notes: 'My route notes',
                response: models.system.user.validator.delete.response,
                handler: models.system.user.controller.delete
            }
        },
        {
            method: 'DELETE',
            path: '/system/users/delete_batch',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '删除批量',
                validate: models.system.user.validator.delete_batch.request,
                notes: 'My route notes',
                response: models.system.user.validator.delete_batch.response,
                handler: models.system.user.controller.delete_batch
            }
        }
    ])
};