import { ObjectId } from "mongodb";
import { client } from "./db.js";
import jwt from 'jsonwebtoken';

export function findUser(userEmail){
     return  client.db("catalog").collection("users").findOne({email:userEmail})  
}

export function addUser(hashedUser){
 return client.db("catalog").collection("users").insertOne(hashedUser)
}

export function generateJWT(id){
    return jwt.sign({id},process.env.secret_key,{expiresIn:"30d"})
}

export function generateResetJWT(id){ 
    return jwt.sign({id},process.env. secret_key,{expiresIn:'5m'})
}

export function findUserById(id){
     return client.db("catalog").collection("users").findOne({_id: new ObjectId(id)});
}

export function updatePassword(id,newhashedpassword){
    return client.db("catalog")
    .collection("users")
    .findOneAndUpdate({_id: new ObjectId(id)},{$set:{password:newhashedpassword}})
}

export function getData(year) {
    const db = client.db(year.toString());
    const dieselData = db.collection("diesel").find().toArray();
    const petrolData = db.collection("petrol").find().toArray();
    const goldData = db.collection("gold").find().toArray();
    
    return Promise.all([dieselData, petrolData, goldData]);
}

export function getIadData(){
    return client.db("catalog").collection("iad").find().toArray();
}
export function getObessData(){
    return client.db("catalog").collection("obesity").find().toArray();
}

export function getOptions (option){
    return client.db("menu").collection(option).find().toArray();
}

export function changeQuantity(item,name,value){
    return  client.db("menu").collection(item).findOneAndUpdate({name:name},{$inc:{quantity: Number(value)}})
     
} 