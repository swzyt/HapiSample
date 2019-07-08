var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.system.button.controller);

    server.route([
        {
            method: 'GET',
            path: '/system/buttons',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '分页方式获取按钮列表信息',
                validate: models.system.button.validator.list.request,
                notes: '分页方式获取按钮列表信息',
                response: models.system.button.validator.list.response,
                handler: models.system.button.controller.list
            }
        },
        {
            method: 'POST',
            path: '/system/buttons',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '创建新的按钮信息',
                validate: models.system.button.validator.create.request,
                notes: 'My route notes',
                response: models.system.button.validator.create.response,
                handler: models.system.button.controller.create
            }
        },
        {
            method: 'GET',
            path: '/system/buttons/{button_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '获取指定标识的按钮信息',
                validate: models.system.button.validator.get.request,
                notes: 'My route notes',
                response: models.system.button.validator.get.response,
                handler: models.system.button.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/system/buttons/{button_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '更新指定标识的按钮信息',
                validate: models.system.button.validator.put.request,
                notes: 'My route notes',
                response: models.system.button.validator.put.response,
                handler: models.system.button.controller.update
            }
        },
        {
            method: 'PUT',
            path: '/system/buttons/update_batch',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '更新批量',
                validate: models.system.button.validator.update_batch.request,
                notes: 'My route notes',
                response: models.system.button.validator.update_batch.response,
                handler: models.system.button.controller.update_batch
            }
        },
        {
            method: 'DELETE',
            path: '/system/buttons/{button_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '删除指定标识的按钮信息',
                validate: models.system.button.validator.delete.request,
                notes: 'My route notes',
                response: models.system.button.validator.delete.response,
                handler: models.system.button.controller.delete
            }
        },
        {
            method: 'DELETE',
            path: '/system/buttons/delete_batch',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-button'],
                description: '删除批量',
                validate: models.system.button.validator.delete_batch.request,
                notes: 'My route notes',
                response: models.system.button.validator.delete_batch.response,
                handler: models.system.button.controller.delete_batch
            }
        }
    ])
};