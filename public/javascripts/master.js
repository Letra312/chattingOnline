"use strict";
function enterChannel(id) {
    let thisActive =document.getElementsByClassName("active")[0];
    thisActive.classList.remove("active");
    let chosenNav = document.getElementById(id);
    chosenNav.classList.add("active");
    document.getElementById("chatInput").style.display="block";
    let container = $("#container");
    let url = "http://localhost:8080/messages/"+id;
    $.ajax({
        type:"GET",
        url:url,
        success:function (data) {
            sessionStorage.roomId=id;
            loadAllMessages(data.data);
            $("#container")[0].scrollTop = $("#container")[0].scrollHeight;
            window.history.pushState({},0,'http://'+window.location.host+'/room/'+id);
            let socket = io.connect();
            console.log(socket);
            socket.on('connect', function () {
                socket.emit('join', JSON.parse(sessionStorage.user).userName);
            });
            socket.on("msg",function (user, msg) {
                $("#container").append(msg.msg);
                $("#container")[0].scrollTop = $("#container")[0].scrollHeight;
            });
            socket.on('sys', function (sysMsg, users) {
                let html=`<div><span style="font-size: 0.6em;color: red;display: inline">系统消息</span>
               <span style="display: inline;float: right;">${window.Date()}</span></div>
               <p style="font-size: 1.2em;">${sysMsg},当前房间人数${users.length}</p>`;
                container.append(html);
                $("#container")[0].scrollTop = $("#container")[0].scrollHeight;
            });
        },
        error:function () {
            layer.msg("服务错误");
        }
    })
}

function loginModel(){
    let e1 = document.getElementById('modal-overlay');
    e1.style.visibility =  (e1.style.visibility === "visible"  ) ? "hidden" : "visible";
}

function loadSockeIo() {
    let btn = document.getElementById("sendInputButton");
    btn.onclick = function () {
        let message = $("#sendInputText").val();
        let container = $("#container");
        let thisTime = window.Date();
        let user = JSON.parse(sessionStorage.user);
        let html=`<div><span style="font-size: 0.6em;display: inline">${user.email}</span>
               <span style="display: inline;float: right">${thisTime}</span></div>
               <p style="font-size: 1.2em;">${message}</p>`;

        let room ={
            _id:sessionStorage.roomId,
            messages:[]
        };
        let messageData = {
            sendUser:user.email,
            contents:message,
            roomId:sessionStorage.roomId,
            sendTime:thisTime
        };
        console.log(sessionStorage.roomId);
        if(sessionStorage.roomId){
            console.log("1");
            let socket = io.connect();
            socket.send({msg:html});

            socket.on("msg",function (userName,msg) {
                container.append(msg.msg);
                container[0].scrollTop = container[0].scrollHeight;
            });
        }
        let url = "http://localhost:8080/messages/sendMessage";
        $.ajax({
           type:'POST',
            url:url,
            data:{room,messageData},
            contentType: "application/x-www-form-urlencoded",
            success:function (data) {
                $("#sendInputText").val("");
            },
            error:function () {
                layer.msg("服务错误");
            }
        });
    };
}

function sendLoadAllRoomsAjax() {
    let url = "http://localhost:8080/rooms";
    $.ajax({
       type:'GET',
       url:url,
        success:function (data) {
            loadAllRooms(data.data);
        },
        error:function () {
            layer.msg("服务错误");
        }
    });
}

function loadNavTabs() {
    let nav=document.getElementById("tab").getElementsByTagName("li");
    let con=document.getElementsByName("content");
    for(let i=0;i<nav.length;i++){
        nav[i].index = i;
        nav[i].onclick=function(){
            for(let n = 0; n < con.length; n++) {
                con[n].style.display = "none";
                nav[n].className = "";
            }
            con[this.index].style.display = "block";
            nav[this.index].className = "cur";
        }
    }
}

function loadUser() {
    if(!sessionStorage.user){
        document.getElementById("signInModelButton").style.display="block";
    }
    else {
        document.getElementById("userCenter").style.display="block";
        let loginUser = JSON.parse(sessionStorage.user);
        document.getElementById("userName").innerHTML = loginUser.userName+",欢迎您!";
        document.getElementById("logoutButton").onclick = function () {
            sessionStorage.clear();
            location.replace("./index.html");
        }
    }
}

function loadAllRooms(data) {
    // let roomArea = document.getElementById("roomArea");
    // for(let room of data){
    //     let newRoom = document.createElement("li");
    //     let newButton = document.createElement("a");
    //     newRoom.className = "leftNav";
    //     newButton.innerHTML = room.roomName;
    //     newButton.id = room._id;
    //     // newButton.onclick = enterChannel(room._id);
    //     newRoom.appendChild(newButton);
    //     roomArea.appendChild(newRoom);
    // }
    // let rooms = roomArea.getElementsByTagName("a");
    // for(let room of rooms){
    //     room.onclick = enterChannel(room.id)
    // }
    let html = "";
    for(let room of data){
        if(data.indexOf(room)===0)
            html+=`<li class="leftNav"><a class="active" id=${room._id} onclick="enterChannel(\'${room._id}\')">${room.roomName}</a></li>`;
        else
            html+=`<li class="leftNav"><a id=${room._id} onclick="enterChannel(\'${room._id}\')">${room.roomName}</a></li>`;
    }
    $("#roomArea").html(html);
}

function loadAllMessages(data) {
    let html = "";
    for(let message of data){
        html+=`<div style="margin-top: 5px"><span style="font-size: 0.5em;display: inline">${message.sendUser}</span>
               <span style="display: inline;float: right">${message.sendTime}</span></div>
               <p style="font-size: 1.2em;">${message.contents}</p>`;
    }
    $("#container").html(html);
}

function listenOnLoginOrSignIn() {
    let logInForm = $("#loginForm"),
    signInForm = $("#signInForm");
    logInForm.on('submit',function (e) {
        let signInEmail = $("#loginEmail").val();
        let signInPassword = $("#loginPassword").val();
        let signInUser ={
            signInEmail:signInEmail,
            signInPassword:signInPassword
        };
        signIn(signInUser);
        return false;
    });
    signInForm.on('submit',function (e) {
        let signUpPassword = $("#signUpPassword").val();
        let repeatPassword = $("#repeatPassword").val();
        if(signUpPassword!==repeatPassword){
            layer.msg("两次密码输入不一致！");
            return false;
        }
        let signUpUserName = $("#signUpUserName").val();
        let signUpEmail = $("#signUpEmail").val();
        let signUpUser = {
            signUpPassword,
            signUpUserName,
            signUpEmail
        };
        console.log(signUpUser);
        signUp(signUpUser);
        return false;
    })
}

function signIn(signInUser) {
    let url="http://localhost:8080/users/signin";
    console.log(signInUser);
    $.ajax({
        type:'POST',
        url:url,
        contentType: "application/x-www-form-urlencoded",
        data:signInUser,
        success:function (data) {
            if(data.data.user){
                if(data.data.user.activationState){
                    sessionStorage.user = JSON.stringify(data.data.user);
                    location.replace("./index.html");
                    layer.msg("登陆成功");
                }else {
                    layer.msg("请激活再登录!");
                }
            }
            else {
                layer.msg(data.msg);
            }
        },
        error:function () {
            layer.msg("服务错误");
        }
    })
}

function signUp(signUpUser) {
    let url="http://localhost:8080/users/signup";
    console.log(signUpUser);
    $.ajax({
        type:'POST',
        url:url,
        data:signUpUser,
        contentType: "application/x-www-form-urlencoded",
        success:function (data) {
            if(data.data.user){
                layer.msg("注册成功!请前往邮箱激活...");
                $("#signInForm")[0].reset();
            }else {
                layer.msg(data.msg);
            }
        },
        error:function () {
            layer.msg("服务错误!");
        }
    });
}

window.onload=function(){
    init();
};

function init() {
    loadSockeIo();
    loadNavTabs();
    loadUser();
    listenOnLoginOrSignIn();
    sendLoadAllRoomsAjax();
}