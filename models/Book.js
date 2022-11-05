import {Schema,model} from "mongoose"

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


const Book=model('Book',bookSchema)
export default Book