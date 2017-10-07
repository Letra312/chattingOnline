"use strict";
const express = require('express');
const router = express.Router();
const User = require('../schemas/users');

// 注册
router.post('/signup', function(req, res, next) {
  let userData = req.body;
  console.log(userData);
  User.findOne({'email':userData.signUpEmail},function (err,user) {
     if(err){
       throw err;
     }
     if(user){
       res.status(200).json({data:{},msg:'邮箱已被注册！'});
       res.end();
     }
     else {
       let newUser = new User();
       newUser.userName = userData.signUpUserName;
       newUser.email = userData.signUpEmail;
       newUser.password = newUser.encryptPassword(userData.signUpPassword);
       newUser.activationState = false;
       newUser.save(function (err,result) {
           if(err){
             throw err;
           }
           res.status(200).json({data:{user:result},msg:"注册成功！"});
           newUser.sendCheckEmail(userData.signUpEmail);
           res.end();
       });
     }
  });
});

//登录
router.post('/signin',function (req,res,next) {
    let userData = req.body;
    console.log(userData);
    console.log(userData.signInEmail);
    User.findOne({'email':userData.signInEmail},function (err,user) {
        console.log(user);
        if(err){throw err;}
        if(!user){
            res.json({data:{},msg:'用户不存在!'});
            return res.end();
        }
        console.log(user.validPassword("Li990312"));
        if(user.validPassword){
            if(!user.validPassword(userData.signInPassword)){
                res.json({data:{},msg:'密码错误!'});
            }else if(!user.activationState){
                res.json({data:{},msg:'邮箱未激活!'});
            } else{
                res.status(200).json({data:{user:user}});
            }
        }
        else {
            res.json({data:{},msg:'服务错误,请重试!'});
        }
    });
});

router.get('/checked',function (req,res, next){
    let checkEmail = req.query.activatingEmail;
    User.update({email:checkEmail},{activationState:true},function (err,resulit) {
        if(err){throw err}
        res.json({data:{},msg:'邮箱激活成功!'});
        // res.redirect('http://localhost:3000');
        res.end();
    });
});

module.exports = router;