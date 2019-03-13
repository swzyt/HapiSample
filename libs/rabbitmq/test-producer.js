/**
 * 生产者者，可多开测试
 */

var RabbitMQ = require("./RabbitMQ");
let mq = new RabbitMQ();

var quene_name = 'task_queue', msg = "";

//批量发送数据测试
let count = 100;
for (let i = 1; i <= count; i++) {
    setTimeout(() => {
        msg = '' + i;
        mq.sendQueueMsg(quene_name, msg, function (result) {
            console.log(` [${i}] 已发送 Result: ${result}`);
        })
    }, i * 500)
}