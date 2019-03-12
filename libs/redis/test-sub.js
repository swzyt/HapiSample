/**
 * 请注意，redis发布和订阅客户端不允许为同一客户端
 * 否则，将出现以下错误
 * ReplyError: ERR only (P)SUBSCRIBE / (P)UNSUBSCRIBE / QUIT allowed in this context
 * 字面意思是此上下文只允许有订阅和取消订阅功能。
 * 解决方法：只要重新建立一个redis链接，专门用来做订阅和取消订阅功能。
 */

const client = require("../cache").client;
client.select(1);//切换到数据库1

//客户端连接redis成功后执行回调
client.on("ready", function () {
    //订阅消息

    //普通订阅
    client.subscribe("test-single");
    //模式订阅，支持正则表达式
    client.psubscribe("test-pattern*");
});

/******************************************************************** */
//普通订阅-监听订阅成功事件
client.on("subscribe", function (channel, count) {
    console.log("普通订阅成功，频道：" + channel + ", 订阅数" + count);
});

//普通订阅-监听取消订阅事件
client.on("unsubscribe", function (channel, count) {
    console.log("普通订阅取消成功，频道：" + channel + ", 订阅数" + count);
});

//普通订阅收到消息，取消指定普通订阅频道
client.on("message", function (channel, message) {
    console.log(`普通订阅 收到信息， 频道：${channel}，消息 ${message}`);
});

//10秒后取消普通订阅
setTimeout(() => {
    client.unsubscribe("test-single");
    client.unsubscribe("test-single-not-exist");//此为不存在频道
}, 10 * 1000);

/******************************************************************** */
//模式订阅-监听订阅成功事件
client.on("psubscribe", function (channel, count) {
    console.log("模式订阅成功，频道：" + channel + ", 订阅数" + count);
});

//模式订阅-监听取消订阅事件
client.on("punsubscribe", function (channel, count) {
    console.log("模式订阅取消成功，频道：" + channel + ", 订阅数" + count);
});

//模式订阅收到消息
client.on("pmessage", function (pattern, channel, message) {
    console.log(`模式订阅 收到信息， 模式：${pattern}，频道：${channel}，消息 ${message}`);
});

//10秒后取消模式订阅，取消指定模式订阅频道
setTimeout(() => {
    client.punsubscribe("test-pattern*");
    client.punsubscribe("test-pattern*-not-exist");//此为不存在频道
}, 10 * 1000);

/******************************************************************** */
//15秒后关闭redis-sub
setTimeout(() => {
    console.log("15秒后关闭redis-sub")
    client.quit();
}, 15 * 1000)