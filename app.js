import express, { urlencoded } from 'express';
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from "cookie-parser";
dotenv.config()
export const app = express();
const corsOptions = {
    origin: "http://localhost:5173", // Replace with the actual origin of your frontend
    credentials: true, // Allow credentials (cookies, headers)
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use((err,req,res,next)=>{
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
    // the error show in maybe message:"someting went wrong ",error : "error send from my error class"
})



import { userRouter } from './routes/userRoute.js';
import { listRoute } from './routes/listRoute.js';
import { listGetRouter } from './routes/getList.js';
app.use("/user",userRouter)
app.use("/list",listRoute)
app.use("/lists",listGetRouter)