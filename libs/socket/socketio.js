
var _ = require('lodash');

var server = require('http').createServer();
var io = require('socket.io')(server);

/* io.use(function (socket, next) {
    var query = socket.request._query;
    console.log(query);
}); */

//连接成功触发事件
io.sockets.on('connection', function (socket) {
    let userId = socket.request._query.userId || '';
    let userName = socket.request._query.userName || '';
    console.log(`客户端连接上了，socketid: ${socket.id}, userId:${userId}, userName:${userName}`)

    //连接成功时，通知当前客户端
    let login_msg = { socketid: socket.id, userId, userName, msg: "恭喜，连接成功！", time: new Date().getTime(), type: 'sys' }
    socket.send(login_msg);

    //并广播所有用户
    login_msg.msg = `${login_msg.socketid} 连接成功`;
    //io.sockets.emit('sys_conn_msg', login_msg);

    //接收客户端send来的信息
    socket.on('message', function (data) {
        console.log(`收到客户端send，content：${JSON.stringify(data)}`)
    });

    //系统消息
    socket.on('sysmsg', function (data) {
    });

    //单人聊天信息
    socket.on('p2pmsg', function (data) {
    });

    //创建房间
    socket.on('room-create', function (data) {
    });

    //删除房间
    socket.on('room-delete', function (data) {
    });

    //加入房间
    socket.on('room-join', function (data) {
    });

    //发送房间消息
    socket.on('roommsg', function (data) {
    });

    //断开连接触发事件
    socket.on('disconnect', function (data) {
        console.log(`客户端断开了，id: ${socket.id} ${JSON.stringify(data)}`)
    });

});

//广播事件
function broadcast() {

    //发送广播测试,system为约定的广播事件
    io.sockets.emit('system', 'broadcast test');
    // 向another room广播一个事件，在此房间所有客户端都会收到消息
    //注意：这里是从服务器的角度来提交事件
    //io.sockets.in('another room').emit('event_name', data);

    //console.log("连接数量："+io.sockets.length)
}
server.listen(2334);

console.log("socketio run at port 2334")