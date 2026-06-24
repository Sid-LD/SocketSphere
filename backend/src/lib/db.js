import mongoose from "mongoose";

export async function connectDB(){
    try{
        const mongoURI = process.env.MONGO_URI;
        if(!mongoURI){
            throw new Error("MONGO_URI is not defined in the environment variables");
        }
        const conn = await mongoose.connect(mongoURI);
        console.log("MongoDB connected ",conn.connection.host);
    }   
    catch(err){
        console.error("Error connecting to MongoDB: ", err.message);
        process.exit(1);
    }
}

