/**
 * 请注意，redis发布和订阅客户端不允许为同一客户端
 * 否则，将出现以下错误
 * ReplyError: ERR only (P)SUBSCRIBE / (P)UNSUBSCRIBE / QUIT allowed in this context
 * 字面意思是此上下文只允许有订阅和取消订阅功能。
 * 解决方法：只要重新建立一个redis链接，专门用来做订阅和取消订阅功能。
 */

const client = require("../cache").client;
client.select(1);//切换到数据库1

//写入redis，并发布消息至频道
function insertRedis(key, value) {
    client.setAsync(key, value).then((result) => {
        //client将当前value发布到当前key频道,然后订阅这个频道的订阅者就会收到消息
        client.publish(key, value);

        console.log(`频道 ${key} 发布了消息：${value}`);
    })
}

/******************************************************************** */
//普通频道发布消息，subscribe方法订阅, unsubscribe方法取消订阅, message方法接收消息
for (let i = 0; i < 5; i++) {
    setTimeout(() => {
        insertRedis('test-single', 'test-single' + i)
    }, i * 1000)
}

/******************************************************************** */
//模式频道发布消息，psubscribe方法订阅, punsubscribe方法取消订阅, pmessage方法接收消息
for (let i = 5; i < 10; i++) {
    setTimeout(() => {
        insertRedis('test-pattern' + i, 'test-pattern' + i)
    }, i * 1000)
}

/******************************************************************** */
//15秒后关闭redis-pub
setTimeout(() => {
    console.log("15秒后关闭redis-pub")
    client.quit();
}, 15 * 1000)