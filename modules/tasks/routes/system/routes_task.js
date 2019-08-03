var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.system.task.controller);

    server.route([
        {
            method: 'GET',
            path: '/system/tasks',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '分页方式获取任务列表信息',
                validate: models.system.task.validator.list.request,
                notes: '分页方式获取任务列表信息',
                response: models.system.task.validator.list.response,
                handler: models.system.task.controller.list
            }
        },
        {
            method: 'POST',
            path: '/system/tasks',
            config: {
                auth: false,
                tags: ['api', 'system-task'],
                description: '创建新的任务信息',
                validate: models.system.task.validator.create.request,
                notes: 'My route notes',
                response: models.system.task.validator.create.response,
                handler: models.system.task.controller.create
            }
        },
        {
            method: 'GET',
            path: '/system/tasks/{task_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '获取指定标识的任务信息',
                validate: models.system.task.validator.get.request,
                notes: 'My route notes',
                response: models.system.task.validator.get.response,
                handler: models.system.task.controller.get
            }
        },
        {
            method: 'PUT',
            path: '/system/tasks/{task_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '更新指定标识的任务信息',
                validate: models.system.task.validator.put.request,
                notes: 'My route notes',
                response: models.system.task.validator.put.response,
                handler: models.system.task.controller.update
            }
        },
        {
            method: 'DELETE',
            path: '/system/tasks/{task_id}',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '删除指定标识的任务信息',
                validate: models.system.task.validator.delete.request,
                notes: 'My route notes',
                response: models.system.task.validator.delete.response,
                handler: models.system.task.controller.delete
            }
        },
        {
            method: 'GET',
            path: '/system/tasks/initredis',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '初始化redis任务队列',
                // validate: models.system.task.validator.initRedis.request,
                notes: '初始化redis任务队列',
                // response: models.system.task.validator.initRedis.response,
                handler: models.system.task.controller.initRedis
            }
        },
        {
            method: 'GET',
            path: '/system/tasks/clearredis',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '清除redis任务队列',
                // validate: models.system.task.validator.clearRedis.request,
                notes: '清除redis任务队列',
                // response: models.system.task.validator.clearRedis.response,
                handler: models.system.task.controller.clearRedis
            }
        },
        {
            method: 'GET',
            path: '/system/tasks/startall',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '手动启动全部任务',
                // validate: models.system.task.validator.startAll.request,
                notes: '手动启动全部任务',
                // response: models.system.task.validator.startAll.response,
                handler: models.system.task.controller.startAll
            }
        },
        {
            method: 'GET',
            path: '/system/tasks/stopall',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '手动停止全部任务',
                // validate: models.system.task.validator.stopAll.request,
                notes: '手动停止全部任务',
                // response: models.system.task.validator.stopAll.response,
                handler: models.system.task.controller.stopAll
            }
        },
        {
            method: 'GET',
            path: '/system/tasks/sync_taskprocess',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '同步任务进程表',
                // validate: models.system.task.validator.syncTaskProcess.request,
                notes: '同步任务进程表',
                // response: models.system.task.validator.syncTaskProcess.response,
                handler: models.system.task.controller.syncTaskProcess
            }
        },
    ])
};