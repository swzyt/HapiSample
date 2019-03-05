"use strict";
var nconf = require('nconf');

nconf.argv().env();

var app_env = nconf.get('NODE_ENV') || 'development';

var config = require('./config/' + app_env + '.json');

config.port = process.env.PORT || config.port;

console.log("****************************************读取配置·开始****************************************")
console.log(`当前运行环境: ${app_env}, 配置项: ${JSON.stringify(config)}`);
console.log("****************************************读取配置·结束****************************************")

module.exports = config;