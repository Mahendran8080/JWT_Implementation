const express=require('express');
const configDB=require('./configDB/config');
const dotenv=require('dotenv');
const userRoute=require('./Routes/userRoute');
const middleware=require('./middleware/auth');

dotenv.config();
const app=express();

configDB();

app.use(express.json());

//here dont have to use middleware since it is common for all of them
app.use('/user',userRoute);
app.use('/user',userRoute);

app.get('/',(req,res)=>{
    res.send("client started");
});

//use middleware in every protected routes.protected routes are those routes where the pages are respective to the users 
//login for all anyone who is not part of the website can view 
//but user details only the signed up user can view so it is considered a protected routes.
//thats why we are passing the middleware 
app.get('/profile',middleware,(req,res)=>{
    res.send("User profile details");
})

app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 4000");
})

