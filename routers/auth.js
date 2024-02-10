import jwt from 'jsonwebtoken';

export function isAuthenticated(req,res,next){
    const token = req.headers["token"]
    
    if(!token){
        return res.status(401).json({data:{error:"Invalid Authorization"}})
    }
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
        if (err) {
          return res.status(400).json({ data: { error: 'Invalid or expired token',err } });
        }else {
            // Access decoded data
            console.log(decoded.id);
            res.status(200).json("token verified")
          }
          next();
    })
}