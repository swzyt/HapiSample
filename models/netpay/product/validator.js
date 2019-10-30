var Joi = require('joi');

var Status = require("../../../libs/status")
var page_size_number = require("../../../libs/page_size_number")

const PREFIX = "Product";

var RequestModel = {
    product_id: Joi.number().integer().optional().description('产品标识'),
    name: Joi.string().allow(['', null]).description('产品名称'),
    product_type: Joi.string().allow(['', null]).description('产品类型'),
    logo_url: Joi.string().allow(['', null]).description('logo'),
    banner_imgs: Joi.string().allow(['', null]).description('banner图'),
    poster_bg_url: Joi.string().allow(['', null]).description('海报背景图'),

    begin_valid_time: Joi.date().optional().description('有效开始时间'),
    end_valid_time: Joi.date().optional().description('有效结束时间'),

    unit_name: Joi.string().allow(['', null]).description('单位描述'),
    description: Joi.string().allow(['', null]).description('描述'),
    valid: Joi.boolean().allow(['', null]).description('是否有效'),

    base_price: Joi.number().optional().description('底价'),
    mark_price: Joi.number().optional().description('标价'),
    installation_fee: Joi.number().optional().description('安装费'),
    optical_modem_deposit: Joi.number().optional().description('光猫押金'),
    operator_cost: Joi.number().optional().description('运营商成本'),
    owner_sharing: Joi.number().optional().description('业主分成'),

    discount_id: Joi.number().integer().allow(null).description('关联折扣标识'),

    projects: Joi.array().optional().description('关联项目'),
};

var ResponseModel = {
    product_id: Joi.number().integer().required().description('产品标识'),

    name: Joi.string().allow(['', null]).description('产品名称'),
    product_type: Joi.string().allow(['', null]).description('产品类型'),
    logo_url: Joi.string().allow(['', null]).description('logo'),
    banner_imgs: Joi.string().allow(['', null]).description('banner图'),
    poster_bg_url: Joi.string().allow(['', null]).description('海报背景图'),

    begin_valid_time: Joi.date().description('有效开始时间'),
    end_valid_time: Joi.date().description('有效结束时间'),

    unit_name: Joi.string().allow(['', null]).description('单位描述'),
    description: Joi.string().allow(['', null]).description('描述'),
    valid: Joi.boolean().allow(['', null]).description('是否有效'),

    base_price: Joi.number().required().description('底价'),
    mark_price: Joi.number().required().description('标价'),
    installation_fee: Joi.number().required().description('安装费'),
    optical_modem_deposit: Joi.number().required().description('光猫押金'),
    operator_cost: Joi.number().required().description('运营商成本'),
    owner_sharing: Joi.number().required().description('业主分成'),

    created_at: Joi.date().description('创建时间'),
    updated_at: Joi.date().description('更新时间'),

    discount_id: Joi.number().integer().allow(null).description('关联折扣标识'),
    discount: Joi.object().allow(null).description('关联折扣对象'),

    projects: Joi.array().required().description('关联项目'),

    // buildings: Joi.array().allow([null, []]).description("楼栋"),
};

module.exports = {
    //获取指定标识对象数据的请求响应消息体
    get: {
        request: {
            params: {
                product_id: Joi.string().required().description('产品标识')
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
                name: Joi.string().allow(['', null]).description('产品名称'),
                description: Joi.string().allow(['', null]).description('描述'),
                valid: Joi.string().allow(['', null]).description('是否有效'),
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
                data: Joi.array().items(Joi.object(ResponseModel).allow(null).meta({ className: PREFIX + "ListResponseData" }))
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
                data: Joi.object(ResponseModel).meta({ className: PREFIX + "PostResponseData" }).required().description("产品信息")
            }).meta({ className: PREFIX + "PostResponse" }).required().description("返回消息体"),
            status: Status
        }
    },
    //更新指定标识对象数据的请求响应消息体
    put: {
        request: {
            params: {
                product_id: Joi.string().required().description('产品标识')
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
                product_id: Joi.string().required().description('产品标识')
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
};