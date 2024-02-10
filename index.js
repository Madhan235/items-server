import express from 'express';
import dotenv from 'dotenv';
import { client } from './db.js';
import cors from 'cors';
import { userRouter } from './routers/users.js';
 
 
 

dotenv.config();
 
 
const app = express();
app.use(express.json());
app.use(cors());

app.use(userRouter);
 
 

app.listen(process.env.PORT, ()=>{
    console.log("server running on PORT")
})