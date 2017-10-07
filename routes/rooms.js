"use strict";
const express = require("express");
const roomRouter =express.Router();
const server = require('../app');
const socketIO = require('socket.io')(server);
console.log(socketIO);
const Room = require('../schemas/rooms');
const User = require('../schemas/users');

roomRouter.get('/',function (req,res,next) {
    Room.find({},function (err,rooms) {
        res.status(200).json({data:rooms});
        res.end();
        // for(let index = 0; index<rooms.length;index++){
        //     socketIO.on("connection",function (socket) {
        //         socket.on(rooms[0]._id,function (data) {
        //             socket.broadcast.emit(rooms[0]._id+"Message",{
        //                 userName:data.userName,
        //                 message:data.message,
        //                 sendTime:data.sendTime
        //             });
        //             if(index===rooms.length-1){
        //                 res.status(200).json({data:rooms});
        //             }
        //         });
        //     });
        // }
    });
});

//创建一个房间
roomRouter.post('/createRoom',function (req,res,next) {
    let user = req.body.user;
    let roomData = req.body.roomData;
    roomData.messages = [];
    let newRoom = new Room(roomData);
    newRoom.save(function (err,room) {
        if(err){throw err}
        let userCreatedRooms = user.createdRooms||[];
        userCreatedRooms.push(room._id);
        User.update({email:user.email},{createdRooms:userCreatedRooms},function (err,user) {
            if(err){throw err}
            res.status(200).json({success:true,data:{room:room},msg:"创建房间成功!"});
            res.end();
        });
    });
});

// roomRouter.prepareSocketIO = function (server) {
//     var io = socketIO.listen(server);
//     if(!!globalRooms){
//         for(let room of globalRooms){
//             io.on("connection",function (socket) {
//                 socket.on(room._id+"Message",function (data) {
//                     console.log("111");
//                     io.emit(room._id+"Message",data);
//                 });
//             });
//         }
//     }
// };

module.exports = roomRouter;