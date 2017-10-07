const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sendUser:{
       type:String,
       require:true
   },
    contents:{
        type:String,
        require:true
    },
    roomId:{
        type:String,
        require:true
    },
    sendTime:{
        type:Date,
        require:true
    },
    sendToUserId:{
        type:String
    }
});

module.exports = mongoose.model('Message',messageSchema);