
var _ = require('lodash');

var server = require('http').createServer();
var io = require('socket.io')(server);

/* io.use(function (socket, next) {
    var query = socket.request._query;
    console.log(query);
}); */

var i_sockets = {};

//连接成功触发事件
io.sockets.on('connection', function (socket) {
    let userId = socket.request._query.userId || '';
    let userName = socket.request._query.userName || '';
    console.log(`客户端连接上了，socketid: ${socket.id}, userId:${userId}, userName:${userName}`)

    socket.userId = userId;
    socket.userName = userName;

    i_sockets[socket.id] = socket;//存储连接对象

    //连接成功时，通知当前客户端
    let login_msg = { socketid: socket.id, userId, userName, msg: "恭喜，连接成功！", time: new Date().getTime(), type: 'sys' }
    socket.send(login_msg);

    //并广播所有用户
    broadcast_user_list();

    //接收客户端send来的信息
    socket.on('message', function (data) {
        console.log(`收到客户端send，content：${JSON.stringify(data)}`)
    });

    //系统消息
    socket.on('sysmsg', function (data) {
    });

    //单人聊天信息
    socket.on('p2pmsg', function (data) {
        console.log(`收到单人聊天消息，content：${JSON.stringify(data)}`)
        data.type = "from";
        let to_socketid = data.to_socketid;
        delete data.to_socketid;
        i_sockets[to_socketid].emit("p2pmsg", data)
    });

    //加入房间
    socket.on('room-join', function (data) {
        console.log("room-join", data)
        socket.join(data.room_name, (join_result) => {
            console.log({ join_result })
            socket.emit("roommsg", { msg: `您已加入房间: ${data.room_name}` })
        })
    });
    //离开房间
    socket.on('room-leave', function (data) {
        console.log("room-leave", data)
        socket.leave(data.room_name, (join_result) => {
            console.log({ join_result })
            socket.emit("roommsg", { msg: `您已离开房间: ${data.room_name}` })
        })
    });

    //发送房间消息
    socket.on('room-msg', function (data) {
    });

    //断开连接触发事件
    socket.on('disconnect', function (data) {
        delete i_sockets[socket.id];

        broadcast_user_list();
        console.log(`客户端断开了，id: ${socket.id} ${JSON.stringify(data)}`)
    });

});

function broadcast_user_list() {
    io.clients((error, clients) => {
        if (error) throw error;

        let user_list = [];
        clients.map(item => {
            user_list.push({ socketid: item, userId: i_sockets[item].userId, userName: i_sockets[item].userName })
        })

        io.sockets.emit('user_list', user_list);
    });
}

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