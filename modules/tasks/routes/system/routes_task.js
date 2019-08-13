var Joi = require('joi');
module.exports = function (server, models) {

    server.bind(models.system.task.controller);

    server.route([
        {
            method: 'GET',
            path: '/systemtasks/v2/tasks',
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
            method: 'GET',
            path: '/systemtasks/v2/tasks/loglist',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '分页方式获取任务日志列表信息',
                validate: models.system.task.validator.loglist.request,
                notes: '分页方式获取任务日志列表信息',
                response: models.system.task.validator.loglist.response,
                handler: models.system.task.controller.loglist
            }
        },
        {
            method: 'POST',
            path: '/systemtasks/v2/tasks',
            config: {
                auth: 'jwt',
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
            path: '/systemtasks/v2/tasks/{task_id}',
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
            path: '/systemtasks/v2/tasks/{task_id}',
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
            path: '/systemtasks/v2/tasks/{task_id}',
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
            path: '/systemtasks/v2/tasks/initredisall',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '初始化redis任务队列',
                // validate: models.system.task.validator.initRedisAll.request,
                notes: '初始化redis任务队列',
                // response: models.system.task.validator.initRedisAll.response,
                handler: models.system.task.controller.initRedisAll
            }
        },
        {
            method: 'GET',
            path: '/systemtasks/v2/tasks/clearredisall',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '清除redis任务队列',
                // validate: models.system.task.validator.clearRedisAll.request,
                notes: '清除redis任务队列',
                // response: models.system.task.validator.clearRedisAll.response,
                handler: models.system.task.controller.clearRedisAll
            }
        },
        {
            method: 'GET',
            path: '/systemtasks/v2/tasks/startall',
            config: {
                auth: 'jwt',
                tags: ['api', 'system-task'],
                description: '手动启动全部有效任务',
                // validate: models.system.task.validator.startAll.request,
                notes: '手动启动全部有效任务',
                // response: models.system.task.validator.startAll.response,
                handler: models.system.task.controller.startAll
            }
        },
        {
            method: 'GET',
            path: '/systemtasks/v2/tasks/stopall',
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
    ])
};