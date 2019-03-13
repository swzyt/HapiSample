/**
 * 对RabbitMQ的封装
 */
let amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.hosts = ["amqp://localhost"];
        this.index = 0;
        this.length = this.hosts.length;
        this.open = amqp.connect(this.hosts[this.index]);
    }
    sendQueueMsg(queueName, msg, errCallBack) {
        let self = this;

        self.open
            .then(function (conn) {
                return conn.createChannel();
            })
            .then(function (channel) {
                return channel.assertQueue(queueName, { durable: true })//监听q队列，设置持久化为true
                    .then(function (ok) {
                        return channel.sendToQueue(queueName, new Buffer(msg), { persistent: true });//persistent 选项让我们发送的消息也是持久化的。
                    })
                    .then(function (data) {
                        if (data) {
                            errCallBack && errCallBack(data);
                            channel.close();
                        }
                    })
                    .catch(function () {
                        setTimeout(() => {
                            if (channel) {
                                channel.close();
                            }
                        }, 5000)
                    });
            })
            .catch(function () {
                let num = self.index++;

                if (num <= self.length - 1) {
                    self.open = amqp.connect(self.hosts[num]);
                } else {
                    self.index == 0;
                }
            });
    }
    receiveQueueMsg(queueName, receiveCallBack, errCallBack) {
        let self = this;

        self.open
            .then(function (conn) {
                return conn.createChannel();
            })
            .then(function (channel) {
                return channel.assertQueue(queueName, { durable: true })//监听q队列，设置持久化为true
                    .then(function (ok) {
                        channel.prefetch(1);//指定消费者同时最多只会派发到1个任务
                        return channel.consume(queueName, function (msg) {
                            if (msg !== null) {

                                let data = msg.content.toString();

                                //ack 操作完成后，通知当前任务已处理完，则等待接收下一次任务
                                //nack 通知当前任务处理失败，则等待接收下一次任务,nack的消息会再次转移给其他消费者处理
                                //此处为防止失败消息出现死循环传递至消费者处理，则同一标识为ack，后续处理失败由回调函数处理
                                channel.ack(msg);
                                //channel.nack(msg);

                                receiveCallBack && receiveCallBack(data);

                            }
                        }, { noAck: false })//开启消息确认标识, 设置noAck为true表示不对消费结果做出回应, 为false则表示需做出回应
                            .finally(function () {
                                setTimeout(() => {
                                    if (channel) {
                                        channel.close();
                                    }
                                }, 5000)
                            });
                    })
            })
            .catch(function () {
                let num = self.index++;
                if (num <= self.length - 1) {
                    self.open = amqp.connect(self.hosts[num]);
                } else {
                    self.index = 0;
                    self.open = amqp.connect(self.hosts[0]);
                }
            });
    }
}

module.exports = RabbitMQ;