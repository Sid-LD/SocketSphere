import express from "express";
import "dotenv/config";
import {connectDB} from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from "@clerk/express";
import cors from 'cors'




const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL=process.env.FRONTEND_URL

app.use(clerkMiddleware());
app.use(express.json())
app.use(cors({origin:FRONTEND_URL, credentials:true}))

app.get('/health', (req, res)=>{
    res.status(200).json({
        ok: true,
        message: "Server is healthy"
    });
})


app.listen(PORT, ()=>{
    connectDB();
    console.log("Server is running on port " + PORT);
    
})