/**
 * api文档状态提示
 */

var Joi = require('joi');

module.exports = {
    404: Joi.string().max(50).required().description('未找到服务器资源'),
    500: Joi.string().max(50).required().description('内部服务器错误')
};