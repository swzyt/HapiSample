var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.netpay.room.controller);

    server.route([
        {
            method: 'GET',
            path: '/netpay/rooms',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-room'],
                description: '分页方式获取房间列表信息',
                validate: models.netpay.room.validator.list.request,
                notes: '分页方式获取房间列表信息',
                response: models.netpay.room.validator.list.response,
                handler: models.netpay.room.controller.list
            }
        },
        {
            method: 'POST',
            path: '/netpay/rooms',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-room'],
                description: '创建新的房间信息',
                validate: models.netpay.room.validator.create.request,
                notes: 'My route notes',
                response: models.netpay.room.validator.create.response,
                handler: models.netpay.room.controller.create
            }
        },
        {
            method: 'GET',
            path: '/netpay/rooms/{room_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-room'],
                description: '获取指定标识的房间信息',
                validate: models.netpay.room.validator.get.request,
                notes: 'My route notes',
                response: models.netpay.room.validator.get.response,
                handler: models.netpay.room.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/netpay/rooms/{room_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-room'],
                description: '更新指定标识的房间信息',
                validate: models.netpay.room.validator.put.request,
                notes: 'My route notes',
                response: models.netpay.room.validator.put.response,
                handler: models.netpay.room.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/netpay/rooms/{room_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'netpay-room'],
                description: '删除指定标识的房间信息',
                validate: models.netpay.room.validator.delete.request,
                notes: 'My route notes',
                response: models.netpay.room.validator.delete.response,
                handler: models.netpay.room.controller.delete
            }
        },
    ])
};