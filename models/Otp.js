import mongoose from "mongoose"
import mailSender from "../utils/mailSender.js"

const otpSchema = new mongoose.Schema({
    email: {type: String, required: true,},
    otp: {type: String, required : true},
    createdAt: {type: Date, default: Date.now, expires: 300}, // OTP expires in 5 minutes
})

async function sendOtpEmail({email, otp}){
    try{
        const res = await mailSender({
            email: email,
            title: "Your OTP for StudyN",
            body: `<h1>Your OTP is ${otp}. It is valid for 5 minutes.</h1>`,
        })
        console.log("OTP email sent successfully", res);

    }catch(error){
        console.log("Error while sending OTP email", error.message);
    }
   
}

otpSchema.pre('save', async function (next){
    if(this.isNew){
        await sendOtpEmail({email: this.email, otp: this.otp});
    }
    next();
})


const Otp = mongoose.model("Otp", otpSchema)
export default Otp