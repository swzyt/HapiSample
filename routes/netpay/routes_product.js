var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.netpay.product.controller);

    server.route([
        {
            method: 'GET',
            path: '/netpay/products',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-product'],
                description: '分页方式获取产品列表信息',
                validate: models.netpay.product.validator.list.request,
                notes: '分页方式获取产品列表信息',
                response: models.netpay.product.validator.list.response,
                handler: models.netpay.product.controller.list
            }
        },
        {
            method: 'POST',
            path: '/netpay/products',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-product'],
                description: '创建新的产品信息',
                validate: models.netpay.product.validator.create.request,
                notes: 'My route notes',
                response: models.netpay.product.validator.create.response,
                handler: models.netpay.product.controller.create
            }
        },
        {
            method: 'GET',
            path: '/netpay/products/{product_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-product'],
                description: '获取指定标识的产品信息',
                validate: models.netpay.product.validator.get.request,
                notes: 'My route notes',
                response: models.netpay.product.validator.get.response,
                handler: models.netpay.product.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/netpay/products/{product_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-product'],
                description: '更新指定标识的产品信息',
                validate: models.netpay.product.validator.put.request,
                notes: 'My route notes',
                response: models.netpay.product.validator.put.response,
                handler: models.netpay.product.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/netpay/products/{product_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-product'],
                description: '删除指定标识的产品信息',
                validate: models.netpay.product.validator.delete.request,
                notes: 'My route notes',
                response: models.netpay.product.validator.delete.response,
                handler: models.netpay.product.controller.delete
            }
        },
    ])
};