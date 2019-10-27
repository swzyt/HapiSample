module.exports = {
    //服务配置
    "server": {

    },
    //模块配置
    "modules": {
        main: {
            "host": "localhost",
            "port": 8880,
            swagger: {
                info: {
                    title: 'HapiSample Main 接口文档',
                    version: "1.0.0",
                    description: 'HapiSample Main 接口文档',
                    contact: {
                        name: 'swzyt',
                        email: 'suwei.me@qq.com'
                    }
                },
                tags: [
                    { "name": "auth", "description": "身份验证", externalDocs: { description: '身份验证', url: 'http://localhost:8887' } },
                    { "name": "netpay-project", "description": "网费-项目" },
                    { "name": "netpay-building", "description": "网费-楼栋" },
                    { "name": "netpay-room", "description": "网费-房间" },
                    { "name": "system-app", "description": "系统-app" },
                    { "name": "system-menu", "description": "系统-菜单" },
                    { "name": "system-button", "description": "系统-按钮" },
                    { "name": "system-role", "description": "系统-角色" },
                    { "name": "system-user", "description": "系统-用户" },
                ]
            }
        },
        auth: {
            "host": "localhost",
            "port": 8881,
            swagger: {
                info: {
                    title: 'HapiSample Auth 接口文档',
                    version: "1.0.0",
                    description: 'HapiSample Auth 接口文档',
                    contact: {
                        name: 'swzyt',
                        email: 'suwei.me@qq.com'
                    }
                },
                tags: [
                    { "name": "auth", "description": "身份验证", externalDocs: { description: '身份验证', url: 'http://localhost:8887' } },
                ]
            }
        },
        storage: {
            "host": "localhost",
            "port": 8882,
            swagger: {
                info: {
                    title: 'HapiSample Storage 接口文档',
                    version: "1.0.0",
                    description: 'HapiSample Storage 接口文档',
                    contact: {
                        name: 'swzyt',
                        email: 'suwei.me@qq.com'
                    }
                },
                tags: [
                    { "name": "storage", "description": "文件存储服务" },
                ]
            },
            file_options: {
                mongodb: {
                    allow: true
                },
                local: {
                    allow: true,
                    dir: "../../static/upload_file/"
                }
            }
        },
        tasks: {
            "host": "localhost",
            "port": 8883,
            swagger: {
                info: {
                    title: 'HapiSample Tasks 接口文档',
                    version: "1.0.0",
                    description: 'HapiSample Tasks 接口文档',
                    contact: {
                        name: 'swzyt',
                        email: 'suwei.me@qq.com'
                    }
                },
                tags: [
                    { "name": "system-task", "description": "系统-定时任务" },
                ]
            }
        }
    },
    //jwt认证配置
    "jwt": {
        //加密密钥
        "secret": "1234567890",
        //过期时间
        "expire_times": 7200
    },
    //mysql数据库配置
    "mysql": {
        "database": "Test",
        "username": "root",
        "password": "root",
        "options": {
            "host": "mysql-master",
            "port": 3306,
            "dialect": "mysql",
            "logging": true,
            "pool": {
                "max": 5,
                "min": 0,
                "acquire": 30000,
                "idle": 10000
            },
            "timezone": "+08:00",
            "dialectOptions": {
                "charset": "utf8mb4"
            }
        }
    },
    //redis配置
    "redis": {
        "host": "local-redis",
        "password": "123456",
        "port": 6379
    },
    //mongodb配置
    "mongodb": {
        "url": "mongodb://local-mongo:27017",
        "dbname": "hapiSample",
        "tableName_api_log": "api_log",
        "tableName_upload_file": "upload_file"
    },
    //rabbitmq配置
    rabbitmq: {
        hosts: [
            "amqp://admin:admin@local-rabbitmq1:5672",//指定帐号密码及端口
            "amqp://admin:admin@local-rabbitmq1:5673",//指定帐号密码及端口
            "amqp://admin:admin@local-rabbitmq1:5674",//指定帐号密码及端口
            // "amqp://localhost"//默认
        ],
        options: {
        }
    },
    //接口日志记录
    "api_log": {
        //是否记录日志
        "on_off": true,
        //不记录日志的路由地址。开头匹配
        "no_url": [
            "/favicon",
            "/swagger",
            "/docs",
            "/documentation"
        ],
        //日志记录数据库
        "db": {
            "mongo": true,
            "mysql": true
        }
    }
}