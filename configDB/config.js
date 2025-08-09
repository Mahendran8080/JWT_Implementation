const mongoose =require('mongoose');
const dotenv=require('dotenv');

dotenv.config();

function configDB()
{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to Mongo db");
    })
    .catch((error)=>{
        console.log(error.message);

    })
}

module.exports=configDB;