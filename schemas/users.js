const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');
const Schema = mongoose.Schema;
const Mock = require('mockjs');
const Random = Mock.Random;
const userSchema = new Schema({
    // personalIcon:{
    //     type:String,
    //     default:"./images/"+this.userName+".png"
    // },
    activationState:{
        type:Boolean,
        require:true
    },
    userName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    createdRooms:{
        type:Array
    }
});

const emailSendServer = nodemailer.createTransport({
    service:'qq',
    port:465,
    secureConnection:true,
    auth:{
        user:'823748341@qq.com',
        pass:'oinwdzkuvhnlbgab'
    }
});

userSchema.methods = {
    //对密码进行加密
    encryptPassword:function (password) {
        return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
    },
    //密码校验
    validPassword:function (password) {
        return bcrypt.compareSync(password,this.password);
    },
    //发送激活邮件
    sendCheckEmail:function (email) {
        let mailOptions = {
            from:'823748341@qq.com',
            to:this.email,
            subject:'Hello Sir!',
            html:`<a target="_blank" rel="nofollow" style="text-decoration:none;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;color:white;background-color:#ea9448;padding:8px 16px;border-radius:4px;font-size:20px;text-transform:uppercase;font-weight:bold;width: 160px;height:60px;"  href=\`http://localhost:8080/users/checked?activatingEmail=${email}\`>邮箱激活</a>`
        };
        emailSendServer.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log(info);
            console.log('Message sent: ' + info.response);
        });
    }
};

module.exports = mongoose.model('User',userSchema);