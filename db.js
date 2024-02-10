import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();
 
const url = process.env.mongoURL

async function createConnection(){
    try {
        const client = new MongoClient(url);
         await client.connect();
console.log("Server Connected to DB");
return client;

    } catch (error) {
        console.log(error);
    }
}

export const client = await createConnection();