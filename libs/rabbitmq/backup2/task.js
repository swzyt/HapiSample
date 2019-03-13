/**
 * Created by Suwei on 19/3/13.
 * 文章链接：https://www.cnblogs.com/cpselvis/p/6294986.html
 */
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    //创建通道
    conn.createConfirmChannel(function (err, ch) {
    //conn.createChannel(function (err, ch) {
        var q = 'task_queue';
        //process.argv 可获取启动时变量
        var msg = process.argv.slice(2).join(' ') || "Hello World!";

        ch.assertQueue(q, { durable: true });//监听q队列，设置持久化为true
        //单次测试
        //ch.sendToQueue(q, new Buffer(msg), { persistent: true });//persistent 选项让我们发送的消息也是持久化的。
        //console.log(" [x] Sent '%s'", msg);

        //批量数据测试
        let count = 20;
        for (let i = 1; i <= count; i++) {
            setTimeout(() => {
                //msg = repeat('' + i, i)
                msg = '' + i
                ch.sendToQueue(q, new Buffer(msg), { persistent: true }, function (err, ok) {
                    console.log(err, ok)
                    if (err !== null) console.warn('Message nacked!');
                    else console.log('Message acked');
                });//persistent 选项让我们发送的消息也是持久化的。

                console.log(` [${i}] Sent '${msg}' `);

                //消息发送完毕，退出
                /* if (i == count) {
                    conn.close();
                    process.exit(0);
                } */
            }, i * 1000)
        }

    });
    //setTimeout(function () { conn.close(); process.exit(0) }, 500);
});

//复制字符串N次
function repeat(str, n) {
    return new Array(n + 1).join(str);
}