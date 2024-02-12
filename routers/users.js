import express from 'express';
const router = express.Router();
import bcrypt  from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { addUser, changeQuantity, findUser, findUserById, generateJWT, generateResetJWT, getData, getIadData, getObessData, getOptions, updatePassword } from '../usersDB.js';
import { isAuthenticated } from './auth.js';

router.post('/signin',async (req,res)=>{
    try {
        const {name,email,password} = req.body;
    // console.log(req.body);
        const checkingUserMail = await findUser(email);

        if(checkingUserMail){
            res.status(400).json("Email already in use")
            return;
        }

        // const checkingUserName = await findUser("",name);

        // if(checkingUserName){
        //     res.status(400).json({err:"Name already in use"})
        //     return;
        // }

       const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const hashedUser = {...req.body, password: hashedPassword}

        const addingUser = await addUser(hashedUser);

        if(addingUser){
            const token = generateJWT(addingUser._id)
            res.status(200).json({token:token,message:"SignedIn Successfully"})
            return;
        }
     
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }

})

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        console.log(req.body);
        const checkingUser = await findUser   (email);
        if(!checkingUser){
            res.status(400).json("Email Not Registered, Please Sign In")
            return;
        }

        const validatePass = await bcrypt.compare(password,checkingUser.password)

        if(!validatePass){
            res.status(400).json("Password InCorrect")
            return;
        }
   const token =  generateJWT(checkingUser._id);
   if(token){
    res.status(200).json({token:token,name:checkingUser.name});
   }
   
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        
    }
})

router.post("/forget-password", async (req, res) => {
    try {
        const {email} = req.body;
        const existingUser = await findUser(email);
        if(!existingUser){
            res.status(400).json("Please Enter Your Registered Email!!")
              return;
        }
        const resetToken = generateResetJWT(existingUser._id);
          
        const resetPasswordLink = `https://catalog23.netlify.app/${existingUser._id}/${resetToken}`

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
             user:"msouljar@gmail.com",
             pass:process.env.MAIL_PASSWORD,
            }
        })

        let mailDetails = {
            from:"msouljar@gmail.com",
            to:`${email}`,
            subject:"RESET PASSWORD LINK",
            text:`${resetPasswordLink}`
        }
        transporter.sendMail(mailDetails, function(err){
            if(err){
                console.error(err)
                return;
            } else{
                console.log("Email sent successfully")
            }
        })

        res.status(200).json({data:{id:existingUser._id,token:resetToken,message:"email successfully sent"}})

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }

})
 
router.post('/resetpassword/:id/:token', async (req, res) => {
    try {
    
        const {id,token} = req.params;
          const {newPassword, confirmPassword} = req.body;
  
        const existingUser = await findUserById(id);


        if (!existingUser) {
              res.status(400).json( 'User not found' );
              return;
            }

          //VERIFYING JWT TOKEN 

          jwt.verify(token, process.env.secret_key, (err, decoded) => {
            if (err) {
                res.status(400).json('Invalid or expired token');
                return;
            }else {
                // Access decoded data
                console.log(decoded.id)
              }
        })
         //CHECKING PASSWORDS MATCHING
         if(newPassword !== confirmPassword ) {
              res.status(400).json( 
            "Password's Not Matching") 
              return; 
          }
          //HASHING PASSWORD
         const salt = await bcrypt.genSalt(10);
         const newHashedPassword = await bcrypt.hash(newPassword, salt)
         //UPDATING NEW PASSWORD
 const updatingPassword = await updatePassword(id,newHashedPassword)
  if(updatingPassword){
    res.status(200).json({changed: true,message:"Password Changed Successfully",name:existingUser.name})
    return;
}
 
  } catch (error) {
    console.error(error);
      res.status(500).json(error);
  }
})

router.post("/authenticate",isAuthenticated,async (req,res)=>{
      
})

router.post('/content',async (req, res) => {
    try { 
        const {year} = req.body;
         const data = await getData(year);
         
          if(data){
            res.status(200).json({diesel:data[0],petrol:data[1],gold:data[2]});
          }
    } catch (error) {
        
        console.log(error);
        res.status(500).json(error);
    }
    }) 
    router.get('/iad',async (req, res) => {
        try {
            const iadData = await getIadData();
            const obessData = await getObessData();
             
            if(iadData && obessData){
                res.status(200).json({iadData:iadData,obessData:obessData});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    })

    router.get("/items",async (req, res) => {
        try {
            const crust = await getOptions("crust")
            const sausage = await getOptions("sausage");
            const cheese = await getOptions("cheese");
            const veggies = await getOptions("veggies");
            const meats = await getOptions("meat");
            if(crust && cheese && sausage && veggies && meats){
                res.status(200).json({crust:crust,cheese:cheese,sausage:sausage,
                veggies:veggies,meats:meats});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error);
            
        }
    })

    router.post("/change_quantity",async (req,res)=>{
        try {
            const {item,name,value} = req.body;
             const isQuantityChanged = await changeQuantity(item,name,value);
             if(isQuantityChanged){
                res.status(200).json("Quantity Changed Successfully");
             }
        } catch (error) {
           console.log(error);
           res.status(500).json(error);            
        }
    } )
    
export const userRouter = router;