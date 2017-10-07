const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roomSchema = new Schema({
    ownerId:{
        type:String,
        require:true
    },
    roomName:{
        type:String,
        require:true
    },
    messages:{
        type:Array,
        require:true,
        default:[]
    }
});

roomSchema.methods = {
    //添加消息
    addAMessage: function (messageId) {
        this.messages.push(messageId);
        return this.messages;
    }
};

module.exports = mongoose.model('Room',roomSchema);