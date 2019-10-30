var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.netpay.operator.controller);

    server.route([
        {
            method: 'GET',
            path: '/netpay/operators',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-operator'],
                description: '分页方式获取运营商列表信息',
                validate: models.netpay.operator.validator.list.request,
                notes: '分页方式获取运营商列表信息',
                response: models.netpay.operator.validator.list.response,
                handler: models.netpay.operator.controller.list
            }
        },
        {
            method: 'POST',
            path: '/netpay/operators',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-operator'],
                description: '创建新的运营商信息',
                validate: models.netpay.operator.validator.create.request,
                notes: 'My route notes',
                response: models.netpay.operator.validator.create.response,
                handler: models.netpay.operator.controller.create
            }
        },
        {
            method: 'GET',
            path: '/netpay/operators/{operator_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-operator'],
                description: '获取指定标识的运营商信息',
                validate: models.netpay.operator.validator.get.request,
                notes: 'My route notes',
                response: models.netpay.operator.validator.get.response,
                handler: models.netpay.operator.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/netpay/operators/{operator_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-operator'],
                description: '更新指定标识的运营商信息',
                validate: models.netpay.operator.validator.put.request,
                notes: 'My route notes',
                response: models.netpay.operator.validator.put.response,
                handler: models.netpay.operator.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/netpay/operators/{operator_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-operator'],
                description: '删除指定标识的运营商信息',
                validate: models.netpay.operator.validator.delete.request,
                notes: 'My route notes',
                response: models.netpay.operator.validator.delete.response,
                handler: models.netpay.operator.controller.delete
            }
        },
    ])
};