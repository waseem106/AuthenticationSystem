import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
 }))

//middlewares
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(express.static("uploads"))

app.get("/",(res,req)=>{
    res.status(200).json({message:"workingwell"})
})

// routes importing 

import userRouter from "./src/routes/user.routes.js";

app.use('/api/users/',userRouter)


export {app}
