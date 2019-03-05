var Joi = require('joi');

var Status = {
    404: Joi.string().max(50).required().description('未找到服务器资源'),
    500: Joi.string().max(50).required().description('内部服务器错误')
};

const PREFIX = "Behavior";

var RequestModel = {
    behavior_id: Joi.string().optional().description('行为标识'),
    action: Joi.string().max(100).allow(['', null]).description('行为动作类型'),
    ip_address: Joi.string().max(100).allow(['', null]).description('ip地址'),
    description: Joi.string().allow(['', null]).description('描述'),
    lat: Joi.number().allow(['', null]).description('纬度'),
    lng: Joi.number().allow(['', null]).description('经度'),
    operator_type: Joi.string().max(100).allow(['', null]).description('操作类型'),
    operator_id: Joi.string().max(100).allow(['', null]).description('操作标识'),
    business_type: Joi.string().max(100).allow(['', null]).description('业务类型'),
    business_id: Joi.string().max(100).allow(['', null]).description('业务标识')
};

var ResponseModel = {
    behavior_id: Joi.string().required().description('行为标识'),
    action: Joi.string().max(100).allow(['', null]).description('行为动作类型'),
    ip_address: Joi.string().max(100).allow(['', null]).description('ip地址'),
    description: Joi.string().allow(['', null]).description('描述'),
    lat: Joi.number().allow(['', null]).description('纬度'),
    lng: Joi.number().allow(['', null]).description('经度'),
    operator_type: Joi.string().max(100).allow(['', null]).description('操作类型'),
    operator_id: Joi.string().max(100).allow(['', null]).description('操作标识'),
    business_type: Joi.string().max(100).allow(['', null]).description('业务类型'),
    business_id: Joi.string().max(100).allow(['', null]).description('业务标识'),
    created_at: Joi.date().description('创建时间'),
    updated_at: Joi.date().description('更新时间'),
    create_user_name: Joi.string().allow(['', null]).description('创建者显示名'),
    update_user_name: Joi.string().allow(['', null]).description('修改者显示名')
};

module.exports = {
    //获取指定标识对象数据的请求响应消息体
    get: {
        request: {
            params: {
                behavior_id: Joi.string().required().description('行为标识')
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
            //status: Status
        }
    },
    //按分页方式获取对象数据的请求响应消息体
    list: {
        request: {
            query: {
                action: Joi.string().allow(['', null]).description('操作类型'),
                operator_type: Joi.string().allow(['', null]).description('操作对象类型'),
                operator_id: Joi.string().allow(['', null]).description('操作对象标识'),
                business_type: Joi.string().allow(['', null]).description('业务类型'),
                business_id: Joi.string().allow(['', null]).description('业务标识'),
                keyword: Joi.string().allow(['', null]).description('关键字'),
                page_size: Joi.number().integer().min(0).default(10).description('分页大小'),
                page_number: Joi.number().integer().min(0).default(1).description('分页页号'),
            }
        },
        response: {
            schema: Joi.object({
                code: Joi.number().integer().description("返回代码"),
                message: Joi.string().description('返回信息'),
                total: Joi.number().integer().description('数据总数'),
                data: Joi.array().items(Joi.object(ResponseModel).meta({ className: PREFIX + "ListResponseData" }))
            }).meta({ className: PREFIX + "ListResponse" }).required().description("返回消息体"),
            //status: Status
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
                data: Joi.object(ResponseModel).meta({ className: PREFIX + "PostResponseData" }).required().description("应用信息")
            }).meta({ className: PREFIX + "PostResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //更新指定标识对象数据的请求响应消息体
    put: {
        request: {
            params: {
                behavior_id: Joi.string().required().description('行为标识')
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
                behavior_id: Joi.string().required().description('行为标识')
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