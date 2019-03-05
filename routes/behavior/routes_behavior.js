var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.behavior.behavior.controller);

    server.route([
        {
            method: 'GET',
            path: '/behavior/v2/behaviors',
            config: {
                //auth: 'default',
                tags: ['api'],
                description: '分页方式获取用戶行为列表信息',
                validate: models.behavior.behavior.validator.list.request,
                notes: '分页方式获取用戶行为列表信息',
                response: models.behavior.behavior.validator.list.response,
                handler: models.behavior.behavior.controller.list
            }
        },
        {
            method: 'POST',
            path: '/behavior/v2/behaviors',
            config: {
                //auth: 'default',
                tags: ['api'],
                description: '创建新的用戶行为信息',
                //validate: models.behavior.behavior.validator.create.request,
                notes: 'My route notes',
                //response: models.behavior.behavior.validator.create.response,
                handler: models.behavior.behavior.controller.create
            }
        },
        {
            method: 'GET',
            path: '/behavior/v2/behaviors/{behavior_id}',
            config: {
                //auth: 'default',
                tags: ['api'],
                description: '获取指定标识的用戶行为信息',
                validate: models.behavior.behavior.validator.get.request,
                notes: 'My route notes',
                response: models.behavior.behavior.validator.get.response,
                handler: models.behavior.behavior.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/behavior/v2/behaviors/{behavior_id}',
            config: {
                //auth: 'default',
                tags: ['api'],
                description: '更新指定标识的用戶行为信息',
                validate: models.behavior.behavior.validator.put.request,
                notes: 'My route notes',
                response: models.behavior.behavior.validator.put.response,
                handler: models.behavior.behavior.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/behavior/v2/behaviors/{behavior_id}',
            config: {
                //auth: 'default',
                tags: ['api'],
                description: '删除指定标识的用戶行为信息',
                validate: models.behavior.behavior.validator.delete.request,
                notes: 'My route notes',
                response: models.behavior.behavior.validator.delete.response,
                handler: models.behavior.behavior.controller.delete
            }
        }
    ])
};