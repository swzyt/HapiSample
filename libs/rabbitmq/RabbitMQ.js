/**
 * RabbitMQ封装
 */
let amqp = require('amqplib');

/**
 * 默认配置
 */
const defaultOptions = {
    /**
     * 持久化队列, 声明队列时, 设置durable属性为true开启队列持久化，默认true
     */
    durable: true,

    /**
     * 持久化消息, 发送消息时, 设置persistent属性为true, 让RabbitMQ持久化当前消息，默认true
     */
    persistent: true,

    /**
     * 消息确认标识, 设置noAck为true表示不需对消费结果做出回应, 为false则表示需做出回应，默认false
     */
    noAck: false,

    /**
     * 同时处理任务数(int), 指定消费者同时最多只会派发到N个任务, 当有N个任务未完成时, 不再接受新任务，默认 1
     */
    prefetch_count: 1
}

class RabbitMQ {
    /**
     * 构造函数
     * @param {Array} hosts RabbitMQ连接地址，数组
     * @param {Object} options 配置项，目前支持['durable', 'persistent', 'noAck', 'prefetch_count']
     */
    constructor(hosts, options) {
        this.hosts = ["amqp://localhost"];
        if (hosts && hosts.length > 0) {
            this.hosts = hosts;
        }

        this.index = 0;
        this.length = this.hosts.length;

        this.open = amqp.connect(this.hosts[this.index]);
        this.init = this.init;

        this.CONN = null;
        this.CHANNEL = null;

        this.options = { ...defaultOptions, ...options };

        console.log(`The current configs. hosts: ${this.hosts.join(", ")}, options: ${JSON.stringify(this.options)}`)
    }
    init() {
        let self = this;

        if (self.CONN && self.CHANNEL) {
            console.log("The RabbitMQ conn and channel is effective!")
            return Promise.resolve(self.CHANNEL);
        }

        return self.open
            .then(function (conn) {
                console.log("The RabbitMQ conn is connected!")

                conn.on("error", (err) => {
                    self.CONN = null;
                    console.log("The RabbitMQ conn is error! The errorMsg is: ", JSON.stringify(err))
                })
                conn.on("close", () => {
                    self.CONN = null;
                    console.log("The RabbitMQ conn is closed!")
                })

                self.CONN = conn;

                return conn.createChannel().then((channel) => {
                    console.log("The RabbitMQ channel is created!")

                    channel.on("error", (err) => {
                        self.CHANNEL = null;
                        console.log("The RabbitMQ channel is error! The errorMsg is: ", JSON.stringify(err))
                    })
                    channel.on("close", () => {
                        self.CHANNEL = null;
                        console.log("The RabbitMQ channel is closed!")
                    })

                    self.CHANNEL = channel;

                    return channel;
                }).catch(function (err) {
                    console.log("The RabbitMQ channel happened a error! The errorMsg is: ", JSON.stringify(err))

                    self.CONN = null;
                    self.CHANNEL = null;

                    let num = self.index++;

                    if (num <= self.length - 1) {
                        self.open = amqp.connect(self.hosts[num]);
                    } else {
                        self.index == 0;
                    }
                });
            })
            .catch(function (err) {
                console.log("The RabbitMQ conn happened a error! The errorMsg is: ", JSON.stringify(err))
                self.CONN = null;
                self.CHANNEL = null;

                let num = self.index++;

                if (num <= self.length - 1) {
                    self.open = amqp.connect(self.hosts[num]);
                } else {
                    self.index == 0;
                }
            });
    }
    sendQueueMsg(queueName, msg, errCallBack) {
        let self = this;

        self.init().then(function (channel) {
            // 声明队列时，设置durable属性为true开启队列持久化
            return channel.assertQueue(queueName, { durable: self.options.durable })
                .then(function (ok) {
                    //发送消息时，设置persistent属性为true，让RabbitMQ持久化当前消息
                    return channel.sendToQueue(queueName, new Buffer(msg), { persistent: self.options.persistent });
                })
                .then(function (data) {
                    errCallBack && errCallBack(data);
                })
        })
    }
    receiveQueueMsg(queueName, receiveCallBack, errCallBack) {
        let self = this;

        self.init().then(function (channel) {
            // 声明队列时，设置durable属性为true开启队列持久化
            return channel.assertQueue(queueName, { durable: true }).then(function (ok) {
                //prefetch(int) 指定消费者同时最多只会派发到N个任务
                //当有N个任务未完成时，不再接受新任务
                channel.prefetch(self.options.prefetch_count);

                return channel.consume(queueName, function (msg) {
                    if (msg && msg.content) {

                        let data = msg.content.toString();

                        if (!self.options.noAck) {
                            //ack 操作完成后，通知当前任务已处理完，则等待接收下一次任务
                            //nack 通知当前任务处理失败，则等待接收下一次任务,nack的消息会再次转移给其他消费者处理
                            //此处为防止失败消息出现死循环传递至消费者处理，则同一标识为ack，后续处理失败由回调函数处理
                            channel.ack(msg);
                            //channel.nack(msg);
                        }

                        receiveCallBack && receiveCallBack(data);

                    }
                    else {
                        //当本次收到的msg有异常时，重新监听消息
                        console.log("The RabbitMQ channel received a null msg, it will again receive!")
                        self.receiveQueueMsg(queueName, receiveCallBack, errCallBack)
                    }
                }, { noAck: self.options.noAck })//开启消息确认标识, 设置noAck为true表示不需对消费结果做出回应, 为false则表示需做出回应
                    .finally(function () {

                    });
            })
        })
    }
}

module.exports = RabbitMQ;