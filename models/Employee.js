const mongoose=require('mongoose')
const Schema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    name:{
        type:String,
        trim:true
    },
    phone:{
        type:String,
        trim:true
    },
    skills:{
        type:[String],
        trim:true
    },
    interests:{
        type:[String],
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    bio:{
        type:String,
        trim:true
    },
    college:{
        type:String,
        trim:true
    },
    careerGoal:{
        type:String,
        trim:true
    },
    profilePhoto: {
        type: String,
        trim: true
    }
})
Schema.pre('save',function(next){
    this.updatedAt=Date.now();
    next();
})

module.exports=mongoose.model('Employee',Schema)