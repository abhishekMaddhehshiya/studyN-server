//send otp function

import User from "../models/User.js";
import bcrypt from "bcrypt"
import Profile from "../models/Profile.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();


export const signup = async (req, res) => {

    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
        } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        if (password !== confirmPassword) {
            return res.json(403).json({
                success: false,
                message: "password and confirmPassword does not match!"
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            })

        }


        const hashPassword = await bcrypt.hash(password, 10);

        const ProfileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
            contactNumber,
            accountType,
            additionalsDetails: ProfileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`

        })

        return res.status(200).json({
            success: true,
            message: "User is Registerd successfully",
            user,
        })

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User can not be resistered. Please try again!",
        })

    }


}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        const user = await User.findOne({ email }).populate("additionalsDetails");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User doesn`t exists. Please Signup first",
            })
        }

        const passwordValidation = await bcrypt.compare(password, user.password);
        if (!passwordValidation) {
            return res.status(500).json({
                success: false,
                message: "Incorrect Password",
            })
        }

        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3d" });
        user.token = token,

        user.password = undefined

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }

        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: "Logged in"
        })



    } catch (error) {
        console.log(error);
        return res.status(403).json({
            success: false,
            message: "Login failure",
        })

    }
}

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, newConfirmPassword } = req.body;

        if ( !oldPassword || !newPassword || !newConfirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }
        if (newPassword !== newConfirmPassword) {
            return res.status(403).json({
                success: false,
                message: "newPassword and newConfirmPassword doesn`t match",
            })
        }

        const email = req.user.email;
        const user = await User.findOne({ email }).populate("additionalsDetails");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User doesn`t exists. Please Signup first",
            })
        }

        

        const passwordValidation = await bcrypt.compare(oldPassword, user.password);

        if (!passwordValidation) {
            return res.status(401).json({
                success: false,
                message: "old Password is incorrect",
            })
        }

 


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(
            user?._id,
            { password: hashedPassword },
            { new: true }
        )
        
        

        return res.status(200).json({
            success: true,
            message: "Password change successfully",
        })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "error while changing your password",
        })
    }

}