const {Schema,model} = require('mongoose')

const bookSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        uppercase:true
    },
    summary:{
        type:String
    },
    fileKey:{
        type:String,
        required:true
    },
    author:{
        type:'ObjectId',
        ref:'User',
        required:true
    },
    category:{
        type:String,
        required:true
    },
    coverPicUrl:{
        type:String,
    }
},{timestamps:true})


module.exports = model('Book',bookSchema)