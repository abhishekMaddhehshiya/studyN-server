import express from "express"
import connectDB from "./config/db.js";
import cloudinaryConnect from "./config/cloudinary.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv"
import userRoutes from "./routes/User.js";
import profileRoutes from "./routes/Profile.js";
import courseRoutes from "./routes/Course.js";
dotenv.config();


const app = express();
connectDB()
cloudinaryConnect()

app.use(express.json());
app.use( cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', 'http://study-n-frontend.vercel.app/'], // frontend URLs
  credentials: true // if you’re using cookies or sessions
}));
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"tmp",
}))


app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile",profileRoutes );
app.use("/api/v1/course",courseRoutes );

app.get("/" , (req,res)=>{
    return res.json({
        success:true,
        message: "Server is running..",
    })
})


const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`app is running at port ${port}`);
});
  