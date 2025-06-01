import express from 'express'
import dotenv from 'dotenv'
import cors from'cors';
import cookieParser from 'cookie-parser';



import authRoutes from './routes/auth.routes.js';



dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: process.env.ORIGIN_URL,
    credentials:true
}))
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("Welcome to LeetLab");
})

app.use('/api/v1/auth', authRoutes);


const PORT = process.env.PORT || 8000; 

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})