var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.system.role.controller);

    server.route([
        {
            method: 'GET',
            path: '/system/roles',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '分页方式获取角色列表信息',
                validate: models.system.role.validator.list.request,
                notes: '分页方式获取角色列表信息',
                response: models.system.role.validator.list.response,
                handler: models.system.role.controller.list
            }
        },
        {
            method: 'POST',
            path: '/system/roles',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '创建新的角色信息',
                validate: models.system.role.validator.create.request,
                notes: 'My route notes',
                response: models.system.role.validator.create.response,
                handler: models.system.role.controller.create
            }
        },
        {
            method: 'GET',
            path: '/system/roles/{role_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '获取指定标识的角色信息',
                validate: models.system.role.validator.get.request,
                notes: 'My route notes',
                response: models.system.role.validator.get.response,
                handler: models.system.role.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/system/roles/{role_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '更新指定标识的角色信息',
                validate: models.system.role.validator.put.request,
                notes: 'My route notes',
                response: models.system.role.validator.put.response,
                handler: models.system.role.controller.update
            }
        },
        {
            method: 'PUT',
            path: '/system/roles/update_batch',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '更新批量',
                validate: models.system.role.validator.update_batch.request,
                notes: 'My route notes',
                response: models.system.role.validator.update_batch.response,
                handler: models.system.role.controller.update_batch
            }
        },
        {
            method: 'DELETE',
            path: '/system/roles/{role_id}',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '删除指定标识的角色信息',
                validate: models.system.role.validator.delete.request,
                notes: 'My route notes',
                response: models.system.role.validator.delete.response,
                handler: models.system.role.controller.delete
            }
        },
        {
            method: 'DELETE',
            path: '/system/roles/delete_batch',
            config: {
                auth: 'jwt',
                tags: ['api'],
                description: '删除批量',
                validate: models.system.role.validator.delete_batch.request,
                notes: 'My route notes',
                response: models.system.role.validator.delete_batch.response,
                handler: models.system.role.controller.delete_batch
            }
        }
    ])
};