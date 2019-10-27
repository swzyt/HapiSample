var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.netpay.project.controller);

    server.route([
        {
            method: 'GET',
            path: '/netpay/projects',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-project'],
                description: '分页方式获取项目列表信息',
                validate: models.netpay.project.validator.list.request,
                notes: '分页方式获取项目列表信息',
                response: models.netpay.project.validator.list.response,
                handler: models.netpay.project.controller.list
            }
        },
        {
            method: 'POST',
            path: '/netpay/projects',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-project'],
                description: '创建新的项目信息',
                validate: models.netpay.project.validator.create.request,
                notes: 'My route notes',
                response: models.netpay.project.validator.create.response,
                handler: models.netpay.project.controller.create
            }
        },
        {
            method: 'GET',
            path: '/netpay/projects/{project_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-project'],
                description: '获取指定标识的项目信息',
                validate: models.netpay.project.validator.get.request,
                notes: 'My route notes',
                response: models.netpay.project.validator.get.response,
                handler: models.netpay.project.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/netpay/projects/{project_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-project'],
                description: '更新指定标识的项目信息',
                validate: models.netpay.project.validator.put.request,
                notes: 'My route notes',
                response: models.netpay.project.validator.put.response,
                handler: models.netpay.project.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/netpay/projects/{project_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-project'],
                description: '删除指定标识的项目信息',
                validate: models.netpay.project.validator.delete.request,
                notes: 'My route notes',
                response: models.netpay.project.validator.delete.response,
                handler: models.netpay.project.controller.delete
            }
        },
    ])
};