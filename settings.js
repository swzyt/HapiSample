"use strict";
var nconf = require('nconf');

nconf.argv().env();

//获取运行时环境变量
//package.json中scripts配置时，在Mac和Linux上使用export， 在windows上export要换成set
var app_env = nconf.get('NODE_ENV') || 'local';
app_env = app_env.replace(/ /g, '');//去除空格

var config = require('./config/' + app_env + '.js');

config.server.port = process.env.PORT || config.server.port;

console.log("****************************************配置·开始****************************************")
console.log(`当前运行环境: ${app_env}`);
console.log(`配置项: ${JSON.stringify(config)}`);
console.log("****************************************配置·结束****************************************")

module.exports = config;