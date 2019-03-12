const client = require("../cache").client;
client.select(1);//切换到数据库1

//写入redis
function insertRedis(key, value) {
    client.setAsync(key, value).then((result) => {
        //client将当前value发布到当前key频道,然后订阅这个频道的订阅者就会收到消息
        client.publish(key, value);

        console.log(`发布信息了 ${key}: ${value}`);
    })
}

for (let i = 0; i < 100; i++) {
    setTimeout(() => {
        insertRedis('test' + i, '' + i)
    }, (i + 1) * 1000)
}