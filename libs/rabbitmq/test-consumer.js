var RabbitMQ = require("./RabbitMQ");
let mq = new RabbitMQ();

var quene_name = 'task_queue';
let exchange_name = "", exchange_type = "", routingKeys = [];

/*********************************普通测试****************************************************/
mq.reveiveDefaultMsg(quene_name, (msg) => {
    console.log(` 默认交换器 接收到消息: ${msg}`)
})
/*********************************普通测试****************************************************/


/*********************************fanout 交换器测试****************************************************/
/* exchange_name = "logs_fanout"; exchange_type = "fanout";
mq.receiveExchangeMsg(exchange_name, exchange_type, null, null, (msg) => {
    console.log(` ${exchange_type} 交换器 ${exchange_name} 接收到消息: ${msg}`)
}) */
/*********************************fanout 交换器测试****************************************************/


/*********************************direct 交换器测试****************************************************/
/* exchange_name = "logs_direct"; exchange_type = "direct"; routingKeys = process.argv.splice(2) || ["info", "warn", "log", "error"]

//可执行 node test-consumer info log、 node test-consumer warn error 进行测试
console.log(routingKeys)

mq.receiveExchangeMsg(exchange_name, exchange_type, null, routingKeys, (msg) => {
    console.log(` ${exchange_type} 交换器 ${exchange_name} 接收到消息: ${msg}`)
}) */
/*********************************direct 交换器测试****************************************************/


/*********************************topic 交换器测试****************************************************/
/* exchange_name = "logs_topic"; exchange_type = "topic"; routingKeys = [(process.argv.splice(2) || ["info", "warn", "log", "error"])[0]]

//可执行 node test-consumer info.*.*、 node test-consumer warn.*.*、 node test-consumer log.#、 node test-consumer error.# 进行测试
console.log(routingKeys)

mq.receiveExchangeMsg(exchange_name, exchange_type, null, routingKeys, (msg) => {
    console.log(` ${exchange_type} 交换器 ${exchange_name} 接收到消息: ${msg}`)
}) */
/*********************************topic 交换器测试****************************************************/
