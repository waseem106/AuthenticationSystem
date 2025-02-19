import mongoose from "mongoose"



export const dbConnect= async ()=>{
    try {
        await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`)
    } catch (error) {
        console.log("Database Connection Error",error)
    }
}

