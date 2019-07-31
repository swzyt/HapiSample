"use strict";
const nconf = require('nconf');

nconf.argv().env();

//获取运行时环境变量
//package.json中scripts配置时，在Mac和Linux上使用export， 在windows上export要换成set
var app_env = nconf.get('NODE_ENV') || 'local';
app_env = app_env.replace(/ /g, '');//去除空格

var config = require('./config/' + app_env + '.js');

//默认主配置
config.server = config.modules.main;

let module_path = process.cwd();
let module_name = module_path.split('\\')[module_path.split('\\').length - 1]
//读取module配置
if (config.modules[module_name]) {
    config.server = config.modules[module_name];
}

// config.server.port = process.env.PORT || config.server.port;

console.log("****************************************配置项****************************************")
console.log(`当前运行环境: ${app_env}`);
console.log(`配置项: ${JSON.stringify(config)}`);
console.log("****************************************配置项****************************************")

module.exports = config;