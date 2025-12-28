import Profile from "../models/Profile.js";
import User from "../models/User.js";
import  uploadImageToCloudinary  from "../utils/imageUploader.js";

export const updateProfile = async(req,res)=>{
    try {
        const {dateOfBirth, gender, about, contactNumber} = req.body;
        const userId = req.user.id;

        if(!userId){
            return res.status(403).json({
                success:false,
                message: "User is not login",
            })
        }

        const user = await User.findById(userId);
        const profileId = user.additionalsDetails;

        const updatedProfile = await Profile.findByIdAndUpdate(
            profileId,
            {
                dateOfBirth:dateOfBirth,
                gender:gender,
                about:about,
                contactNumber:contactNumber,
            },
            {new: true},
        );

        const response = await User.findById(userId).populate("additionalsDetails").exec();

        return res.status(200).json({
            success:true,
            message: "profile updated successfully",
            data: response,
        })


        
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "error while updating profile details",
            error: error.message
        })
    }
}


//delete account
export const deleteAccount = async(req,res)=>{
    try {
        const userId = req.user.id;

        const validUser = await User.findById(userId);
        if(!validUser){
            return res.status(403).json({
                success:false,
                message: "User is not valid",
            })
        }

        const profileId = validUser.additionalsDetails;

        await Profile.findByIdAndDelete(profileId);
        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success:true,
            message: "profile deleted successfully",
        })


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "error while deleting account",
            error: error.message
        })
    }
}


export const getUserAllDetails = async (req,res)=>{
    try {
        const userId = req.user.id;

        const userDetails = await User.findOne({_id:userId}).populate("additionalsDetails").exec();

        return res.status(200).json({
            success:true,
            message: "user details fetched successfully",
            data: userDetails
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "error while fetching account details",
            error: error.message
        })
    }
}


export const getEnrolledCourses = async (req,res)=>{
    try {
        const userId = req.user.id;

        const userDetails = await User.findById(userId).populate("courses").exec();
        const enrolledCourses = userDetails.courses


        return res.status(200).json({
            success:true,
            message: "enrolled courses fetched successfully",
            data: enrolledCourses
        })


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "error while fetching enrolled courses details",
            error: error.message
        })
    }
}


export const updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    ).populate("additionalsDetails")
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
