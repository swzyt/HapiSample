module.exports = {
    //服务配置
    "server": {

    },
    //模块配置
    "modules": {
        main: {
            "host": "localhost",
            "port": 8888
        },
        auth: {
            "host": "localhost",
            "port": 8887
        },
        tasks: {
            "host": "localhost",
            "port": 8889
        }
    },
    //jwt认证配置
    "jwt": {
        //加密密钥
        "secret": "1234567890",
        //过期时间
        "expire_times": 1800
    },
    //mysql数据库配置
    "mysql": {
        "database": "Test",
        "username": "root",
        "password": "123456",
        "options": {
            "host": "local-mysql-master",
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
        "port": 6379
    },
    //mongodb配置
    "mongodb": {
        "url": "mongodb://local-mongo:27017",
        "dbname": "hapiSimple",
        "tableName_api_log": "api_log",
        "tableName_upload_file": "upload_file"
    },
    //rabbitmq配置
    rabbitmq: {
        hosts: [
            "amqp://admin:admin@local-rabbitmq1:5672",//指定帐号密码及端口
            "amqp://localhost"//默认
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
            "/documentation"
        ],
        //日志记录数据库
        "db": {
            "mongo": true,
            "mysql": true
        }
    }
}