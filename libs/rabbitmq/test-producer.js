var RabbitMQ = require("./RabbitMQ");
let mq = new RabbitMQ(["amqp://localhost1", "amqp://localhost2", "amqp://localhost"]);

//mq.init();//调用可测试mq是否可连接

var quene_name = 'task_queue', msg = "";

let exchange_name = "", exchange_type = "", routingKey = '', routingKeys = [];

let msg_count = 50;

/*********************************普通测试****************************************************/
for (let i = 1; i <= msg_count; i++) {
    setTimeout(() => {
        msg = '' + i;
        mq.sendDefaultMsg(quene_name, msg)
            .then((result) => {
                console.log(` 默认交换器 [${i}] 已发送 Result: ${JSON.stringify(result)}`);
            })
            .catch((error) => {
                console.error(` 默认交换器 [${i}] 发送失败 Error: ${JSON.stringify(error)}`);
            })
    }, i * 200)
}
/*********************************普通测试****************************************************/


/*********************************fanout 测试****************************************************/
//广播类型，多消费者均收到同意的消息
/* exchange_name = "logs_fanout"; exchange_type = "fanout"; routingKey = '';
for (let i = 1; i <= msg_count; i++) {
    setTimeout(() => {
        msg = '' + i;
        mq.sendExchangeMsg(exchange_name, exchange_type, routingKey, msg)
            .then((result) => {
                console.log(` fanout交换器 [${i}] 已发送 Result: ${JSON.stringify(result)}`);
            })
            .catch((error) => {
                console.error(` fanout交换器 [${i}] 发送失败 Error: ${JSON.stringify(error)}`);
            })
    }, i * 100)
} */
/*********************************fanout 测试****************************************************/


/*********************************direct 测试****************************************************/
//direct类型，可指定接收routingkey消息
/* exchange_name = "logs_direct"; exchange_type = "direct"; routingKeys = ["info", "warn", "log", "error"]
for (let i = 1; i <= msg_count; i++) {
    setTimeout(() => {
        let key = routingKeys[randomNum(0, 3)]
        msg = key + i;

        mq.sendExchangeMsg(exchange_name, exchange_type, key, msg)
            .then((result) => {
                console.log(` direct 交换器 [${key} ${i}] 已发送 Result: ${JSON.stringify(result)}`);
            })
            .catch((error) => {
                console.error(` direct 交换器 [${key} ${i}] 发送失败 Error: ${JSON.stringify(error)}`);
            })
    }, i * 100)
} */
/*********************************direct 测试****************************************************/


/*********************************topic 测试****************************************************/
//topic类型，可按*或#指定接收routingkey消息
/* exchange_name = "logs_topic"; exchange_type = "topic"; routingKeys = ["info", "warn", "log", "error"]
for (let i = 1; i <= msg_count; i++) {
    setTimeout(() => {
        let key = routingKeys[randomNum(0, 3)] + "." + routingKeys[randomNum(0, 3)] + "." + routingKeys[randomNum(0, 3)]
        msg = key + i;

        mq.sendExchangeMsg(exchange_name, exchange_type, key, msg)
            .then((result) => {
                console.log(` topic 交换器 [${key} ${i}] 已发送 Result: ${JSON.stringify(result)}`);
            })
            .catch((error) => {
                console.error(` topic 交换器 [${key} ${i}] 发送失败 Error: ${JSON.stringify(error)}`);
            })
    }, i * 100)
} */
/*********************************topic 测试****************************************************/


//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}