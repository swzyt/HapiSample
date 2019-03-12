const client = require("../cache").client;
client.select(1);//切换到数据库1

//客户端连接redis成功后执行回调
client.on("ready", function () {
    //订阅消息
    //目前测试，node下不支持正则订阅多个频道
    //在命令行模式下支持
    //client.subscribe("test");
    //client.psubscribe("test.*");
    //client.psubscribe(["test", "test0", "test1", "test2", "test3"]);
    //client.PSUBSCRIBE(["test", "test0", "test1", "test2", "test3", "test*"]);
    //client.PSUBSCRIBE(["test*"]);

    for (let i = 0; i < 100; i++) {
        client.subscribe("test" + i);
    }
});

//监听订阅成功事件
client.on("subscribe", function (channel, count) {
    console.log("client subscribed to " + channel + ", " + count + " total subscriptions");
});

//监听取消订阅事件
client.on("unsubscribe", function (channel, count) {
    console.log("client unsubscribed from" + channel + ", " + count + " total subscriptions")
});

//收到消息后执行回调，message是redis发布的消息
client.on("message", function (channel, message) {
    console.log(`收到信息了 ${channel}: ${message}`);
});