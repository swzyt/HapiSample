var Joi = require('joi');

var Status = require("../../../libs/status")//api文档状态提示

var Page_size_number = require("../../../libs/page_size_number")//默认分页参数配置项

const PREFIX = "SystemApp";

var RequestModel = {
    app_id: Joi.string().optional().description('应用标识id'),
    name: Joi.string().allow(['', null]).description('应用名称'),
    secret: Joi.string().allow(['', null]).description('应用密钥'),
    description: Joi.string().allow(['', null]).description('描述')
};

var ResponseModel = {
    app_id: Joi.string().required().description('应用标识id'),
    name: Joi.string().allow(['', null]).description('应用名称'),
    secret: Joi.string().allow(['', null]).description('应用密钥'),
    description: Joi.string().allow(['', null]).description('描述'),
    created_at: Joi.date().allow(['', null]).description('创建时间'),
    updated_at: Joi.date().allow(['', null]).description('更新时间')
};

module.exports = {
    //获取指定标识对象数据的请求响应消息体
    get: {
        request: {
            params: {
                app_id: Joi.string().required().description('应用标识id')
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                data: Joi.object(ResponseModel)
                    .meta({ className: PREFIX + "GetResponseData" })
                    .allow(['', null])
                    .description("信息")
            }).meta({ className: PREFIX + "GetResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //按分页方式获取对象数据的请求响应消息体
    list: {
        request: {
            query: {
                name: Joi.string().allow(['', null]).description('应用名称'),
                description: Joi.string().allow(['', null]).description('描述'),

                ...Page_size_number
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                total: Joi.number().integer().description('数据总数'),
                data: Joi.array().items(Joi.object(ResponseModel).allow(['', null]).meta({ className: PREFIX + "ListResponseData" }))
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
                app_id: Joi.string().required().description('应用标识id')
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
    //删除指定标识对象数据的请求响应消息体
    delete: {
        request: {
            params: {
                app_id: Joi.string().required().description('应用标识id')
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