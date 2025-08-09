const userModel=require('../Models/userModel');
const bcrypt=require('bcrypt');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');

dotenv.config();

const logIn=async(req,res)=>{
    const {name,email,password}=req.body;

    try
    {
        const exists=await userModel.findOne({email});

        if(exists)
        {
            const isMatch=await bcrypt.compare(password,exists.password);
            if(isMatch)
            {
                const token=jwt.sign({id:exists._id,email:exists.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
                return res.json({success:true,message:"user logged in",token});

            }
            else
            {
                return res.json({success:false,message:"Password is incorrect"});
            }
        }
        else
        {
            return res.json({success:false,message:"User does not exist please create a new one"});
        }

    }
    catch(error)
    {
        console.log(error);
    }
}

const signUp= async(req,res)=>{

    const {name,email,password}=req.body;

    try
    {
        const exists=await userModel.findOne({email});

        if(exists)
        {
            return res.json({success:false,message:"User already exists"});

        }

        // const salt=bcrypt.genSalt(5);
        const hashedPassword=await bcrypt.hash(password,5);

        const newUser=new userModel({
            name:name,
            email:email,
            password:hashedPassword,
        });

        const user=await newUser.save();
        return res.json({success:true,message:"new user created"});




    }
    catch(error)
    {
        console.log(error);
    }

}

module.exports={signUp,logIn};