import bcrypt from 'bcryptjs'
import {db} from '../libs/db.js'
import { Prisma, UserRole } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'

export const register = async (req,res)=>{

    const {name, email, password} = req.body;

    try {
        const existingUser = await db.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({
                error:"user already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data:{
                email,
                password:hashedPassword,
                name,
                role:UserRole.USER
            }
        })

        const token = jwt.sign({id:newUser.id},process.env.JWT_SECRET,{
            expiresIn:"7d"
        })

        res.cookie("jwt", token, {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge: 1000*60*60*24*7 // =7days  
        })

        res.status(201).json({
            message: "User created successfully",
            user: {
                id:newUser.id,
                email:newUser.email,
                name:newUser.name,
                role:newUser.role,
                image:newUser.image
            }
        })
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({
            error:error.message
        })
    }
}

export const login = async(req,res)=>{

    const {email , password} = req.body;
    
    try {
        const user = await db.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
           return  res.status(401).json({
                message:"User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
           return  res.status(401).json({
                message:"Invalid credentials"
            })
        }

        const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{
            expiresIn:"7d"
        })

        res.cookie("jwt", token,{
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000*60*60*24*7
        })

        res.status(200).json({
            user:{
                id:user.id,
                email:user.email,
                name:user.name,
                role:user.role,
                image:user.image
            }
        })
    } catch (error) {
        console.error("Error Logging In User");
        return res.status(500).json({
            error:error.message
        })
    }
}

export const logout = async(req,res)=>{

    
    try {
        res.clearCookie("jwt", {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
        })

        res.status(200).json({
            success:true,
            message:"User logged out successfully"
        })
    } catch (error) {
        console.error("Error logging out");
        res.status(500).json({
            error:error.message
        })
        
    }
}

export const check = async(req,res)=>{
    try{
        res.status(200).json({
            success:true,
            message:"User authenticated successfully",
            user:req.user
        })
    }catch(error){
        console.error("Error checking user:",error);
        res.status(500).json({
            error:error.message
        })
    }
}