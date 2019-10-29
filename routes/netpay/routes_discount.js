var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.netpay.discount.controller);

    server.route([
        {
            method: 'GET',
            path: '/netpay/discounts',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-discount'],
                description: '分页方式获取折扣列表信息',
                validate: models.netpay.discount.validator.list.request,
                notes: '分页方式获取折扣列表信息',
                response: models.netpay.discount.validator.list.response,
                handler: models.netpay.discount.controller.list
            }
        },
        {
            method: 'POST',
            path: '/netpay/discounts',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-discount'],
                description: '创建新的折扣信息',
                validate: models.netpay.discount.validator.create.request,
                notes: 'My route notes',
                response: models.netpay.discount.validator.create.response,
                handler: models.netpay.discount.controller.create
            }
        },
        {
            method: 'GET',
            path: '/netpay/discounts/{discount_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-discount'],
                description: '获取指定标识的折扣信息',
                validate: models.netpay.discount.validator.get.request,
                notes: 'My route notes',
                response: models.netpay.discount.validator.get.response,
                handler: models.netpay.discount.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/netpay/discounts/{discount_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-discount'],
                description: '更新指定标识的折扣信息',
                validate: models.netpay.discount.validator.put.request,
                notes: 'My route notes',
                response: models.netpay.discount.validator.put.response,
                handler: models.netpay.discount.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/netpay/discounts/{discount_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-discount'],
                description: '删除指定标识的折扣信息',
                validate: models.netpay.discount.validator.delete.request,
                notes: 'My route notes',
                response: models.netpay.discount.validator.delete.response,
                handler: models.netpay.discount.controller.delete
            }
        },
    ])
};