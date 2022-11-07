require('dotenv').config()
const express=require('express')
const cors=require('cors')
const cookieParser =require('cookie-parser')
const mongoose=require('mongoose')
//connect mongoose
// mongoose.connect(process.env.MONGO_URI).then(()=>console.log('MongoDB is connected!')).catch(e=>{
mongoose.connect(process.env.MONGO_CLOUD_URL).then(()=>console.log('MongoDB is connected!')).catch(e=>{
    process.nextTick(()=>{
        throw Error(e)
    })
})
//-------------------- express setup---------------
const app=express()
const port=process.env.PORT || 5000
app.use(cors({
    credentials:true
}))
app.use(express.json({limit:'150mb'}))
app.use(express.urlencoded({extended:false,limit:'150mb'}))
app.use(cookieParser(process.env.COOKIE_SECRET))
//---------------------------- api routes----------------------------

//--------------@api/---------------
app.use('/api',require('./routes/home'))
//--------@/api/auth---------------
app.use('/api/auth',require('./routes/auth'))
//--------@/api/books---------------
app.use('/api/books',require('./routes/book'))
//-----------@/api/authors-----------
app.use('/api/authors',require('./routes/authors'))

//listening server
app.listen(port, ()=>console.log(`Server is runing on ${port}`))