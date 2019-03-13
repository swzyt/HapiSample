/**
 * 消费者，可多开测试
 */
var RabbitMQ = require("./RabbitMQ");
let mq = new RabbitMQ();

var quene_name = 'task_queue';

mq.receiveQueueMsg(quene_name, (msg) => {
    console.log(` mq 接收到消息: ${msg}`)
})

