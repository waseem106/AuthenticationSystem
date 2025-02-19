
import { dbConnect } from './src/db/db.js';
import { app } from './app.js';
import dotenv from 'dotenv';
dotenv.config();



dbConnect()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("error")
})


