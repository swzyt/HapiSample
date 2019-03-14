/**
 * 消费者，可多开测试
 */
var RabbitMQ = require("./RabbitMQ");
let mq = new RabbitMQ(undefined, { xxx: 1, prefetch_count: 20 });

var quene_name = 'task_queue';

mq.receiveQueueMsg(quene_name, (msg) => {
    console.log(` mq 接收到消息: ${msg}`)
})

