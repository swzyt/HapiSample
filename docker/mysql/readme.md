# 部署教程
# https://www.jianshu.com/p/40e8b7548f03

******************************************************************************************************************************

1、docker-compose 文件执行后，将创建mysql主从两个容器

2、进入主库命令行界面，执行以下命令
 1）grant replication slave on *.* to 'root'@'172.25.0.102' identified by '123456';
 2）flush privileges;
 注：注意密码是否填错
 3）show master status;
 注：获取mysql-master的binlog开始主从复制的地址。其中 File 和 Position 两项在从库命令行中需要用到

3、进入从库命令行界面，执行以下命令
 1）reset slave;
 2）change master to master_host='172.25.0.101',master_user='root',master_password='123456',master_log_file='mysql-bin.000003',master_log_pos=592; 
 注：注意密码是否填错... master_log_file 和 master_log_pos 分别为上述 2.3 中提到的 File 和 Position
 3）start slave;
 4）show slave status;
 注：Slave_IO_Running | Slave_SQL_Running这两列必须为yes。如有意外情况，则删除容器创建产生的文件后重试

4、主从配置完成，可以进行测试了。

******************************************************************************************
注意，当重启主从之后，配置信息丢失。需要重新对master_log_file文件及master_log_pos进行配置。