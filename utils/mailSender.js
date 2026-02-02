import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

const mailSender =  async ({email, title, body} )=>{
    try{
        console.log("INSIDE MAIL SENDER>>>>>>>>>>>>>>>>>>>>>")
        let transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : process.env.MAIL_USER,
                pass : process.env.MAIL_PASS,
            },

            
        })
        console.log("TRANSPORTER CREATED>>>>>>>>>>>>>")

        let info  = await transporter.sendMail({
            from: `StudyN <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        console.log(info);
        return info;


    }catch(error){
        console.log("Error while sending mail", error.message);
    }
    
}

export default mailSender;