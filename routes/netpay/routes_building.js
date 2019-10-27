var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.netpay.building.controller);

    server.route([
        {
            method: 'GET',
            path: '/netpay/buildings',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-building'],
                description: '分页方式获取楼栋列表信息',
                validate: models.netpay.building.validator.list.request,
                notes: '分页方式获取楼栋列表信息',
                response: models.netpay.building.validator.list.response,
                handler: models.netpay.building.controller.list
            }
        },
        {
            method: 'POST',
            path: '/netpay/buildings',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-building'],
                description: '创建新的楼栋信息',
                validate: models.netpay.building.validator.create.request,
                notes: 'My route notes',
                response: models.netpay.building.validator.create.response,
                handler: models.netpay.building.controller.create
            }
        },
        {
            method: 'GET',
            path: '/netpay/buildings/{building_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-building'],
                description: '获取指定标识的楼栋信息',
                validate: models.netpay.building.validator.get.request,
                notes: 'My route notes',
                response: models.netpay.building.validator.get.response,
                handler: models.netpay.building.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/netpay/buildings/{building_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-building'],
                description: '更新指定标识的楼栋信息',
                validate: models.netpay.building.validator.put.request,
                notes: 'My route notes',
                response: models.netpay.building.validator.put.response,
                handler: models.netpay.building.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/netpay/buildings/{building_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-building'],
                description: '删除指定标识的楼栋信息',
                validate: models.netpay.building.validator.delete.request,
                notes: 'My route notes',
                response: models.netpay.building.validator.delete.response,
                handler: models.netpay.building.controller.delete
            }
        },
    ])
};