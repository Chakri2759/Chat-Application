import mongoose from "mongoose";

export const connectDB = async()=>{
    try{
       await  mongoose.connect(process.env.MONGOURL);
       console.log("mongoDB connected successfully");
    }
    catch(error){
        console.log("mongoDB connection error")
    }
}