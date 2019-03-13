/**
 * Created by Suwei on 19/3/13.
 * 文章链接：https://www.cnblogs.com/cpselvis/p/6294986.html
 */
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createConfirmChannel(function (err, ch) {
        //conn.createChannel(function (err, ch) {
        var q = 'task_queue';

        ch.assertQueue(q, { durable: true });//监听队列持久化
        ch.prefetch(1);//指定worker同时最多只会派发到1个任务
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            if (msg && msg.content) {
                console.log(" [x] Received %s", msg.content.toString());
                if (msg.content.toString() == "10" || msg.content.toString() == "20") {
                    setTimeout(function () {
                        console.log(" [x] Not Done");
                        ch.nack(msg);//nack 通知当前任务处理失败，则等待接收下一次任务,nack的消息会再次转移给其他消费者处理
                    }, 10000);
                }
                else {
                    setTimeout(function () {
                        console.log(" [x] Done");
                        ch.ack(msg);//ack 操作完成后，通知当前任务已处理完，则等待接收下一次任务
                    }, 1000);
                }
            }
        }, { noAck: false });// 开启消息确认标识, 设置noAck为true表示不对消费结果做出回应, 为false则表示需做出回应
    });
});