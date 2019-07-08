/**
 * RabbitMQ封装
 */
let amqp = require('amqplib');

const _ = require("lodash");

//消息类型
let msgType = ["default", "exchange"]

/**
 * 默认配置
 */
const defaultOptions = {
    /**
     * 设置队列自动删除，当链接断开时，队列也会删除, 默认false
     */
    autoDelete: false,

    /**
     * 持久化队列, 声明队列时, 设置durable属性为true开启队列持久化, 默认true
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
    prefetch_count: 1,
}

class RabbitMQ {
    /**
     * 构造函数
     * @param {Array} hosts RabbitMQ连接地址，数组, 默认连接第1个，当出现异常时，自动遍历数组内的地址连接
     * @param {Object} options 配置项，目前支持['autoDelete', 'durable', 'persistent', 'noAck', 'prefetch_count']
     */
    constructor(hosts, options) {
        this.hosts = ["amqp://localhost"];

        //因为连接异常丢失的消息
        this.missMsg = [];

        //异常重连定时器
        this._rabbit_interval;

        if (hosts && hosts.length > 0) {
            this.hosts = hosts;
        }

        this.currentHostIndex = 0;
        this.hostCount = this.hosts.length;

        this.open = amqp.connect(this.hosts[this.currentHostIndex]);
        this.init = this.init;

        this.CONN = null;
        this.CHANNEL = null;

        this.options = { ...defaultOptions, ...options };

        //console.log(`The current configs. hosts: ${this.hosts.join(", ")}, options: ${JSON.stringify(this.options)}`)
    }
    init(msgItem) {
        let self = this;

        if (self.CONN && self.CHANNEL) {
            //console.log(`The RabbitMQ conn and channel is effective! at ${self.hosts[self.currentHostIndex]}`)
            return Promise.resolve(self.CHANNEL);
        }

        return self.open
            .then(function (conn) {
                //console.log(`The RabbitMQ conn is connected! at ${self.hosts[self.currentHostIndex]}`)

                conn.on("error", (err) => {
                    self.CONN = null;
                    console.error("The RabbitMQ conn is error! The errorMsg is: ", JSON.stringify(err))
                    reConnect(err)
                })
                conn.on("close", (err) => {
                    self.CONN = null;
                    console.info("The RabbitMQ conn is closed!")
                    reConnect(err)
                })

                self.CONN = conn;

                return conn.createChannel().then((channel) => {
                    //console.log(`The RabbitMQ channel is created! at ${self.hosts[self.currentHostIndex]}`)

                    channel.on("error", (err) => {
                        self.CHANNEL = null;
                        console.error("The RabbitMQ channel is error! The errorMsg is: ", JSON.stringify(err))
                        reConnect(err)
                    })
                    channel.on("close", (err) => {
                        self.CHANNEL = null;
                        console.info("The RabbitMQ channel is closed!")
                        reConnect(err)
                    })

                    self.CHANNEL = channel;

                    self._rabbit_interval && clearInterval(self._rabbit_interval)

                    self.processMissMsg();

                    return channel;
                }).catch(function (err) {
                    reConnect(err, msgItem)
                });
            })
            .catch(function (err) {
                reConnect(err, msgItem)
            });

        function reConnect(err, msgItem) {

            msgItem && self.missMsg.push(msgItem)

            //console.error("The RabbitMQ conn happened an error! The errorMsg is: ", JSON.stringify(err))
            self.CONN = null;
            self.CHANNEL = null;

            //主机连接轮询
            let index = self.currentHostIndex + 1;

            if (index >= self.hostCount)
                self.currentHostIndex = 0;
            else
                self.currentHostIndex = index;

            self.open = amqp.connect(self.hosts[self.currentHostIndex]);

            if (!self._rabbit_interval) {
                self._rabbit_interval = setInterval(() => {
                    console.log("开始重连", self.hosts[self.currentHostIndex])
                    //异常重新连接
                    self.init(msgItem);
                }, 3000);
            }
        }
    }

    processMissMsg() {
        let self = this;
        self.missMsg = _.uniq(self.missMsg)
        let msgArr = _.cloneDeep(self.missMsg);

        if (msgArr) {
            msgArr.map((item, index) => {
                console.log(self.missMsg.length, JSON.stringify(item), index)
                self.missMsg.splice(0, 1)

                if (item.msgType == msgType[0]) {
                    self.sendDefaultMsg(item.data.queueName, item.data.msg);
                }
                if (item.msgType == msgType[1]) {
                    self.sendExchangeMsg(item.data.exchangeName, item.data.exchangeType, item.data.routingKey, item.data.msg);
                }
            })
        }
    }

    /**
     * 发送默认交换器消息
     * @param {String} queueName 队列名称
     * @param {String} msg 消息内容
     */
    sendDefaultMsg(queueName, msg) {
        let self = this;

        let msgItem = { msgType: msgType[0], data: { queueName, msg } }

        return self.init(msgItem).then(function (channel) {
            if (self.CHANNEL) {
                return self.CHANNEL.assertQueue(queueName, { autoDelete: self.options.autoDelete, durable: self.options.durable })
                    .then(function (q) {
                        return self.CHANNEL.sendToQueue(q.queue, new Buffer(msg), { persistent: self.options.persistent });
                    })
                    .catch((error) => {
                        return Promise.reject(error)
                    })
            }
            return null;
        }).catch(err => {
            return null
        })
    }
    /**
     * 接收默认交换器消息
     * @param {String} queueName 队列名称
     * @param {Function} receiveCallBack 接收消息后回调处理函数
     */
    reveiveDefaultMsg(queueName, receiveCallBack) {
        let self = this;

        return self.init().then(function (channel) {
            if (self.CHANNEL) {
                return self.CHANNEL.assertQueue(queueName, { autoDelete: self.options.autoDelete, durable: self.options.durable }).then(function (q) {

                    self.CHANNEL.prefetch(self.options.prefetch_count);

                    return self.CHANNEL.consume(q.queue, function (msg) {

                        if (msg && msg.content) {

                            let content = msg.content.toString();

                            if (!self.options.noAck) {
                                //ack 操作完成后，通知当前任务已处理完，则等待接收下一次任务
                                //nack 通知当前任务处理失败，则等待接收下一次任务,nack的消息会再次转移给其他消费者处理
                                //此处为防止失败消息出现死循环传递至消费者处理，则同一标识为ack，后续处理失败由回调函数处理
                                //self.CHANNEL.ack(msg);
                                //self.CHANNEL.nack(msg);
                            }

                            receiveCallBack && receiveCallBack(msg, content);
                        }
                        else {
                            //当本次收到的msg有异常时，重新监听消息
                            //console.error("The RabbitMQ channel received a null msg, it will again receive!")
                            self.reveiveDefaultMsg(q.queue, receiveCallBack)
                        }

                    }, { noAck: self.options.noAck })
                })
            }
            return null
        }).catch(err => {
            return null
        })
    }
    /**
     * 发送指定类型交换器及路由key消息
     * @param {String} exchangeName 自定义交换器名称
     * @param {String} exchangeType 交换器类型，目前支持fanout，direct，topic
     * @param {String} routingKey 指定路由key
     * @param {String} msg 消息内容
     */
    sendExchangeMsg(exchangeName, exchangeType, routingKey, msg) {
        let self = this;

        if (!(routingKey && routingKey.length))
            routingKey = "";

        let msgItem = { msgType: msgType[1], data: { exchangeName, exchangeType, routingKey, msg } }

        return self.init(msgItem).then(function (channel) {
            if (self.CHANNEL) {

                self.CHANNEL.assertExchange(exchangeName, exchangeType, { autoDelete: self.options.autoDelete, durable: self.options.durable });

                return self.CHANNEL.publish(exchangeName, routingKey, new Buffer(msg), { persistent: self.options.persistent })
            }
            return null;
        }).catch(err => {
            return null
        })
    }
    /**
     * 接收指定类型交换器及路由key消息，路由key支持*、#选取
     * @param {String} exchangeName 自定义交换器名称
     * @param {String} exchangeType 交换器类型，目前支持fanout，direct，topic
     * @param {String} queueName 队列名称，可为空字符串，将生成非持久队列
     * @param {Array} routingKeys 指定路由key，支持*、#选取
     * @param {Function} receiveCallBack 接收消息后回调处理函数
     */
    receiveExchangeMsg(exchangeName, exchangeType, queueName, routingKeys, receiveCallBack) {
        let self = this;

        if (!queueName)
            queueName = "";

        return self.init().then(function (channel) {
            if (self.CHANNEL) {

                self.CHANNEL.assertExchange(exchangeName, exchangeType, { durable: self.options.durable });

                //队列名称作为空字符串提供时，创建一个具有生成名称的非持久队列
                //当声明它的连接关闭时，队列将被删除，因为它被声明为排它，即exclusive=true
                return self.CHANNEL.assertQueue(queueName, { exclusive: true })
                    .then((q) => {

                        self.CHANNEL.prefetch(self.options.prefetch_count);

                        if (routingKeys && routingKeys.length > 0) {
                            routingKeys.forEach(function (item) {
                                self.CHANNEL.bindQueue(q.queue, exchangeName, item);
                            });
                        }
                        else {
                            self.CHANNEL.bindQueue(q.queue, exchangeName, '');
                        }

                        return self.CHANNEL.consume(q.queue, function (msg) {

                            if (msg && msg.content) {

                                let content = msg.content.toString();

                                if (!self.options.noAck) {
                                    //ack 操作完成后，通知当前任务已处理完，则等待接收下一次任务
                                    //nack 通知当前任务处理失败，则等待接收下一次任务,nack的消息会再次转移给其他消费者处理
                                    //此处为防止失败消息出现死循环传递至消费者处理，则同一标识为ack，后续处理失败由回调函数处理
                                    //self.CHANNEL.ack(msg);
                                    //self.CHANNEL.nack(msg);
                                }

                                receiveCallBack && receiveCallBack(msg, content);

                            }
                            else {
                                //当本次收到的msg有异常时，重新监听消息
                                //console.error("The RabbitMQ channel received a null msg, it will again receive!")
                                self.receiveExchangeMsg(exchangeName, exchangeType, routingKeys, receiveCallBack)
                            }

                        }, { noAck: self.options.noAck });
                    })
            }
            return null;
        }).catch(err => {
            return null
        })
    }
}

module.exports = RabbitMQ;