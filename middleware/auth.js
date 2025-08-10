const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config();

async function middleware(req,res,next)
{
    const {token}=req.headers;
    console.log(token);
    if(!token)
    {
        return res.json({success:false,message:"Not authorized login"});
    }

    try
    {   console.log(token);
        const token_decode=jwt.verify(token,process.env.JWT_SECRET); //obj. name email 
        req.user=token_decode; // after you  logged in the deatils is feeded into the URI so we dont have to send details like name email passord every time
        next();//to pass to the route handler. simply if we dont give next it will not move on to the other functions it just simply stays here
    }
    catch(error)
    {
        console.log(error.message);
    }

}

module.exports=middleware;