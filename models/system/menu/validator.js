var Joi = require('joi');

var Status = require("../../../libs/status")
var page_size_number = require("../../../libs/page_size_number")

const PREFIX = "Menu";

var RequestModel = {
    menu_id: Joi.string().optional().description('菜单id'),
    name: Joi.string().max(100).allow(['', null]).description('菜单名称'),
    path: Joi.string().max(100).allow(['', null]).description('路由地址'),
    component: Joi.string().max(100).allow(['', null]).description('页面地址'),
    icon: Joi.string().max(100).allow(['', null]).description('图标'),
    description: Joi.string().allow(['', null]).description('描述'),
    valid: Joi.boolean().allow(['', null]).description('是否有效'),
    is_show: Joi.boolean().allow(['', null]).description('是否显示在菜单'),
    sort: Joi.number().allow(['', null]).description('排序值'),
    target: Joi.string().max(100).allow(['', null]).description('链接打开方式'),
    parent_id: Joi.string().allow(['', null]).description('父级菜单id'),
    buttons: Joi.array().allow('', null).description('按钮'),
};

var ResponseModel = {
    menu_id: Joi.string().required().description('菜单id'),
    name: Joi.string().max(100).allow(['', null]).description('菜单名称'),
    path: Joi.string().max(100).allow(['', null]).description('路由地址'),
    component: Joi.string().max(100).allow(['', null]).description('页面地址'),
    icon: Joi.string().max(100).allow(['', null]).description('图标'),
    description: Joi.string().allow(['', null]).description('描述'),
    valid: Joi.boolean().allow(['', null]).description('是否有效'),
    is_show: Joi.boolean().allow(['', null]).description('是否显示在菜单'),
    sort: Joi.number().allow(['', null]).description('排序值'),
    target: Joi.string().max(100).allow(['', null]).description('链接打开方式'),
    parent_id: Joi.string().allow(['', null]).description('父级菜单id'),
    created_at: Joi.date().description('创建时间'),
    updated_at: Joi.date().description('更新时间')
};

module.exports = {
    //获取指定标识对象数据的请求响应消息体
    get: {
        request: {
            params: {
                menu_id: Joi.string().required().description('菜单标识')
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                data: Joi.object(ResponseModel)
                    .meta({ className: PREFIX + "GetResponseData" })
                    .allow(null)
                    .description("信息")
            }).meta({ className: PREFIX + "GetResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //按分页方式获取对象数据的请求响应消息体
    list: {
        request: {
            query: {
                name: Joi.string().max(100).allow(['', null]).description('菜单名称'),
                path: Joi.string().max(100).allow(['', null]).description('路由地址'),
                component: Joi.string().max(100).allow(['', null]).description('页面地址'),
                description: Joi.string().allow(['', null]).description('描述'),
                valid: Joi.string().allow(['', null]).description('是否有效'),
                is_show: Joi.string().allow(['', null]).description('是否显示在菜单'),
                sort: Joi.number().allow(['', null]).description('排序值'),
                target: Joi.string().allow(['', null]).description('链接打开方式'),
                parent_id: Joi.string().allow(['', null]).description('父级菜单id'),
                created_at: Joi.string().allow(['', null]).description('创建时间'),
                updated_at: Joi.string().allow(['', null]).description('更新时间'),
                ...page_size_number
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                total: Joi.number().integer().description('数据总数'),
                data: Joi.array().items(Joi.object(ResponseModel).meta({ className: PREFIX + "ListResponseData" }))
            }).meta({ className: PREFIX + "ListResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //获取菜单树列表
    treelist: {
        request: {
            query: {
                type: Joi.string().default('simple').required().description('查询类型。简版(simple)/完整(full)'),
                name: Joi.string().max(100).allow(['', null]).description('菜单名称'),
                path: Joi.string().max(100).allow(['', null]).description('路由地址'),
                component: Joi.string().max(100).allow(['', null]).description('页面地址'),
                description: Joi.string().allow(['', null]).description('描述'),
                valid: Joi.string().allow(['', null]).description('是否有效'),
                is_show: Joi.string().allow(['', null]).description('是否显示在菜单'),
                sort: Joi.number().allow(['', null]).description('排序值'),
                target: Joi.string().allow(['', null]).description('链接打开方式'),
                parent_id: Joi.string().allow(['', null]).description('父级菜单id'),
                created_at: Joi.string().allow(['', null]).description('创建时间'),
                updated_at: Joi.string().allow(['', null]).description('更新时间'),
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                data: Joi.array().meta({ className: PREFIX + "ListResponseData" }).allow(['', null])
            }).meta({ className: PREFIX + "ListResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //创建新的对象数据的请求响应消息体
    create: {
        request: {
            payload: Joi.object(RequestModel).meta({ className: PREFIX + 'PostRequest' })
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                data: Joi.object(ResponseModel).meta({ className: PREFIX + "PostResponseData" }).allow(['', null]).description("应用信息")
            }).meta({ className: PREFIX + "PostResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //更新指定标识对象数据的请求响应消息体
    put: {
        request: {
            params: {
                menu_id: Joi.string().required().description('菜单标识')
            },
            payload: Joi.object(RequestModel).meta({ className: PREFIX + 'PutRequest' })
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息, 默认:OK')
            }).meta({ className: PREFIX + "PutResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //更新批量
    update_batch: {
        request: {
            payload: {
                menu_ids: Joi.array().required().description('菜单标识'),
                ...RequestModel
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息, 默认:OK')
            }).meta({ className: PREFIX + "PutResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //删除指定标识对象数据的请求响应消息体
    delete: {
        request: {
            params: {
                menu_id: Joi.string().required().description('菜单标识')
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息')
            }).meta({ className: PREFIX + "DeleteResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //删除批量
    delete_batch: {
        request: {
            payload: {
                menu_ids: Joi.array().required().description('菜单标识')
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息')
            }).meta({ className: PREFIX + "DeleteResponse" }).required().description("返回消息体"),
            status: Status
        }
    }
};