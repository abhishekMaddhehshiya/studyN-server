import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB =  () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log("db connect successfully")
    }).catch((err)=>{
        console.log("db connection failed");
        console.error(err);
        process.exit(1);
    })
}

export default connectDB