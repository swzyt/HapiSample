# 使用 docker-compose 部署本地 mysql 主从环境

# Usage

如需要修改 mysql 默认账号密码，请修改 docker-compose.yml 文件内容

假定你已经安装了 docker-compose

1、进入目录，部署 mysql 主从

```shell
$ cd mysql-master-slave
$ docker-compose up -d
```

3、查看配置是否成功

```shell
$ docker logs -f mysql-config
```

