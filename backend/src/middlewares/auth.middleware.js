import jwt from 'jsonwebtoken'
import { db } from '../libs/db.js'

export const authMiddleware = async (req,res,next)=>{
    try {
        const token  = req.cookies.jwt;

        if(!token){
           return res.status(401).json({
                message:"Unauthorized - No token provided"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token , process.env.JWT_SECRET);
            console.log('decoded',decoded);
        } catch (error) {
           return res.status(401).json({
                error:"Unauthorized - Invalid token"
            })
        }
        console.log("decode Id :",decoded.id)
        const user = await db.user.findUnique({
            where:{
                id:decoded.id
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true
            }            
        });

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error authenticating user:", error);
        return res.status(500).json({message:"Error authenticating user"});
    }
}