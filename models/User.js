import {Schema,model} from "mongoose"
import {hash,compare} from "bcrypt"

const userSchema=new Schema({
    name:{
        type:String,
        trim:true,
        minLength:3,
        index:true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9 ]+$/.test(v);
            },
            message: props => `${props.value} must contains [aA-zZ] letters and spaces only!`
          },
          required: [true, 'Name Field is required']
    },
    email:{
        type:String,
        unique:true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address`
          },
          required: [true, 'Email Field is required!']
    },
    password:{
        type:String,
        required:[true,'Passsword Field is required!'],
        minLength:[5,'minimum 5 characters needed!'],
        select:false
    }
})


//instance methods
userSchema.methods.compareHash=function (password) {
    return compare(password,this.password)
}

//middlwares
userSchema.pre('save',async function (next) {
    try {
         this.password=await hash(this.password,10)
         next()
    } catch (error) {
        next(error)
    }
})
const User=model('User',userSchema)
export default User