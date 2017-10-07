const express = require('express');
const http = require('http');

const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//引入express-session模块
const session = require('express-session');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chat',{ useMongoClient: true });

const index = require('./routes/index');
const users = require('./routes/users');
const rooms = require('./routes/rooms');
const messages = require('./routes/messages');

var app = express();
var server = http.Server(app);

server.listen(8080, function () {
    console.log('server listening on port 3000');
});
module.exports = server;

var io = require('socket.io')(server);

app.all('*',function (req,res,next) {
    res.header("Access-Control-Allow-Origin","*");
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(validator());
app.use(session({
    secret: 'hxq',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection:mongoose.connection
    }),
    cookie:{max:180*60*1000}
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use('/users', users);
app.use('/rooms', rooms);
app.use('/messages',messages);

var roomInfo = {};
io.on('connection', function (socket) {
    var url = socket.request.headers.referer;
    var splitedArr = url.split('/');
    var roomID = splitedArr[splitedArr.length - 1];
    var user = '';
    console.log(url);

    socket.on('join', function (userName) {
        user = userName;

        // 将用户昵称加入房间名单中
        if (!roomInfo[roomID]) {
            roomInfo[roomID] = [];
        }
        roomInfo[roomID].push(user);

        // 加入房间
        socket.join(roomID);
        // 通知房间内人员
        io.to(roomID).emit('sys', user + '加入了房间', roomInfo[roomID]);
        console.log(user + '加入了' + roomID);
    });

    socket.on('leave', function () {
        socket.emit('disconnect');
    });

    socket.on('disconnect', function () {
        // 从房间名单中移除
        var index = roomInfo[roomID].indexOf(user);
        if (index !== -1) {
            roomInfo[roomID].splice(index, 1);
        }
        socket.leave(roomID);    // 退出房间
        io.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
        console.log(user + '退出了' + roomID);
    });
    socket.on('message', function (msg) {
        console.log(msg);

        io.to(roomID).emit('msg', user, msg);
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});