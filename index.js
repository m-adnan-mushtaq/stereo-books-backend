import "./config/dotenv.js"
import express from 'express'
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
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
    origin:[process.env.LOCAL_FRONT_END_URL, process.env.CLOUD_FRONT_END_URL],
    credentials:true
}))
app.use(express.json({limit:'150mb'}))
app.use(express.urlencoded({extended:false,limit:'150mb'}))
app.use(cookieParser(process.env.COOKIE_SECRET))
//---------------------------- api routes----------------------------
import homeRoutes from "./routes/home.js"
import authRoutes from "./routes/auth.js"
import bookRoutes from "./routes/book.js"
import authorRoutes from "./routes/authors.js"

//--------------@api/---------------
app.use('/api',homeRoutes)
//--------@/api/auth---------------
app.use('/api/auth',authRoutes)
//--------@/api/books---------------
app.use('/api/books',bookRoutes)
//-----------@/api/authors-----------
app.use('/api/authors',authorRoutes)

//listening server
app.listen(port, ()=>console.log(`Server is runing on ${port}`))