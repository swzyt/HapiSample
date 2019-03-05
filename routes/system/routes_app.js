var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.system.app.controller);

    server.route([
        {
            method: 'GET',
            path: '/system/apps',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '分页方式获取应用列表信息',
                validate: models.system.app.validator.list.request,
                notes: '分页方式获取应用列表信息',
                response: models.system.app.validator.list.response,
                handler: models.system.app.controller.list
            }
        },
        {
            method: 'POST',
            path: '/system/apps',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '创建新的应用信息',
                validate: models.system.app.validator.create.request,
                notes: 'My route notes',
                response: models.system.app.validator.create.response,
                handler: models.system.app.controller.create
            }
        },
        {
            method: 'GET',
            path: '/system/apps/{app_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '获取指定标识的应用信息',
                validate: models.system.app.validator.get.request,
                notes: 'My route notes',
                response: models.system.app.validator.get.response,
                handler: models.system.app.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/system/apps/{app_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '更新指定标识的应用信息',
                validate: models.system.app.validator.put.request,
                notes: 'My route notes',
                response: models.system.app.validator.put.response,
                handler: models.system.app.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/system/apps/{app_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '删除指定标识的应用信息',
                validate: models.system.app.validator.delete.request,
                notes: 'My route notes',
                response: models.system.app.validator.delete.response,
                handler: models.system.app.controller.delete
            }
        }
    ])
};