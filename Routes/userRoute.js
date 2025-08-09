const express=require('express');
const {signUp,logIn}=require('../Controllers/userController');


const userRoute=express.Router();

userRoute.post('/signup',signUp);
userRoute.post('/login',logIn);

module.exports=userRoute;