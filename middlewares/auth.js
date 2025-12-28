import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const auth = async (req, res, next) => {
    try {
        let token =  req.cookies?.token || req.body?.token || req.headers["authorization"];
        
        if (token && token.startsWith("Bearer ")) {
            token = token.replace("Bearer ", "");
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token is missing",
            })
        }

        // console.log("token found...................................................", token);

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            // console.log("decoded user information...................................................", decode);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong while Validating Token",
        })

    }

}

export const isStudent = async (req, res, next) => {
    try {

        if(req.user.accountType !== "Student"){
            return res.status(403).json({
                success:false,
                message: "this route is protected for students only",
            })
        }

        next();

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified",
        })

    }
}


export const isInstructor = async (req, res, next) => {
    try {

        if(req.user.accountType !== "Instructor"){
            return res.status(403).json({
                success:false,
                message: "this route is protected for Instructors only",
            })
        }

        next();

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified",
        })

    }
}


export const isAdmin = async (req, res, next) => {
    try {

        if(req.user.accountType !== "Admin"){
            return res.status(403).json({
                success:false,
                message: "this route is protected for Admin only",
            })
        }

        next();

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified",
        })

    }
}