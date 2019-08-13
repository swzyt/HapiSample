# Hapi 快速开发框架
>基于Hapi框架快速开发前后端分离项目中的api部分

## 项目简介

HapiSample 是使用 **Node.js** 开发的后端api系统  
基于 **Docker**、 **Mysql**、 **Redis** 、 **MongoDB**、 **RabbitMQ** , 能快速开发前后端分离项目中的api部分, 你完全可以基于此项目，搭建认证授权、文件存储、任务调度等服务  

## 模块介绍

项目目前分为四块：主项目、认证授权、文件存储 及 任务调度  
子模块在**modules**文件夹内

## 开发环境准备

```
1. 开发环境 Windows10 
2. 开发工具 VS Code
3. 我本机的开发环境，均安装在docker内，如您本机有安装mysql、redis、mongodb、rabbitmq等基础服务，则可直接开发调试  
否则，请先阅读以下docker开发环境部署步骤
4、打开根目录下docker文件夹，里面包含各项基础服务docker-compose文件，可直接运行
5. 启动 Mysql、MongoDB、Redis 和 RabbitMQ
6. 安装项目依赖包 `npm install`
```

## 开发调试

```
1. 运行主项目 `node index.js`
2. visit `http://localhost:8880/docs`

3. 安装运行所需文件，与主项目共享，执行 `install.bat(windows下)`
4. 运行认证授权项目  `node modules/auth/index.js`
5. visit `http://localhost:8881/docs`

6. 安装运行所需文件，与主项目共享，执行 `install.bat(windows下)`
7. 运行文件存储项目  `node modules/storage/index.js`
8. visit `http://localhost:8882/docs`

9. 安装运行所需文件，与主项目共享，执行 `install.bat(windows下)`
10. 运行任务调度项目  `node modules/tasks/index.js`
11. visit `http://localhost:8883/docs`

12. done!
```

## 贡献

有任何意见或建议都欢迎提 issue，或者直接提给 [@swzyt](https://github.com/swzyt)

## License

MIT
