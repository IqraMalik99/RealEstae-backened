import express, { urlencoded } from 'express';
import dotenv from 'dotenv'
import cors from "cors"
import cookieParser from "cookie-parser";
dotenv.config()
export const app = express();
const corsOptions = {
    origin: "https://real-estate-frontened-2j5k.vercel.app",
    credentials: true, 
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('trust proxy', 1);

app.use((err,req,res,next)=>{
    console.error('Error:', err.message); // Log the error
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
    // the error show in maybe message:"someting went wrong ",error : "error send from my error class"
})



import { userRouter } from './routes/userRoute.js';
import { listRoute } from './routes/listRoute.js';
import { listGetRouter } from './routes/getList.js';
app.use("/user",userRouter)
app.use("/list",listRoute)
app.use("/lists",listGetRouter)
