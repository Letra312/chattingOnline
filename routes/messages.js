"use strict";
const express = require('express');
const messageRouter = express.Router();
const Room = require('../schemas/rooms');
const server = require('../app');
const socketIO = require('socket.io')(server);
const User = require('../schemas/users');
const Message = require('../schemas/messages');

messageRouter.get('/:roomId',function (req,res,next) {
    let thisRoomId = req.params.roomId;
    Message.find({roomId:thisRoomId},function (err,messages) {
        res.status(200).json({data:messages});
    });
});

messageRouter.post('/sendMessage',function (req,res,next) {
    let thisRoom = req.body.room;
    let messageData = req.body.messageData;
    let newMessage = new Message(messageData);
    socketIO.on("connection",function (socket){
        socket.on(thisRoom._id+"Message",function (data) {
            console.log("111");
            socketIO.emit(thisRoom._id+"Message",data);
        });
    });
    newMessage.save(function (err,message) {
       if(err){throw err}
       let thisRoomMessages = thisRoom.messages||[];
       thisRoomMessages.push(message._id);
       Room.update({_id:thisRoom._id},{messages:thisRoomMessages},function (err,room) {
           if(err) {throw err}
           res.status(200).json({success:true,data:{message:message}});
           res.end();
       })
    });
});

module.exports = messageRouter;