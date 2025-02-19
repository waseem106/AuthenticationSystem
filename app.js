import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app=express();
app.use(cors({
    origin: 'https://waseem106.github.io',
    optionsSuccessStatus: 200 // For legacy browser support    

 }))
//  origin:process.env.CORS_ORIGIN,
 // credentials:true
//middlewares
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(express.static("uploads"))

app.get("/", (req, res) => {
    res.send("Hello from Vercel!");
  });

// routes importing 

import userRouter from "./src/routes/user.routes.js";

app.use('/api/users/',userRouter)


export {app}
