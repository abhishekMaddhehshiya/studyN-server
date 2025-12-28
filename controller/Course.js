import Course from "../models/Course.js"
import Category from "../models/Category.js"
import User from "../models/User.js"
import uploadImageToCloudinary from "../utils/imageUploader.js"
import dotenv, { populate } from "dotenv";
dotenv.config();

export const createCourse = async (req,res)=>{
    try {
        const {courseName, courseDescription, whatYouWillLearn, price,category,tag} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn|| !price || !category || !thumbnail || !tag){
            return res.status(400).json({
                success:false,
                message: "all fields are required",
            })

        }

        const userId = req.user.id
        // console.log(userId)
        const instructorDetails = await User.findById(userId);
        // console.log("Instructor Details: ", instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message: "instructor not found",
            })
        }

        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(400).json({
                success:false,
                message: "Invalid Category",
            })
        }

        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        // console.log(thumbnailImage)

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: userId,
            whatYouWillLearn,
            price,
            category,
            thumbnail: thumbnailImage.secure_url,
            tag,
        })

      

        await User.findByIdAndUpdate(
            userId, 
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true}
        )
    

        await Category.findByIdAndUpdate(
            category,
            {
                $push:{
                    course: newCourse._id,
                }
            },
            {new:true}
        )


        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        })


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "Error while creating Course",
            error:error.message
        })
    }
    
}


export const getAllCourses = async (req,res)=>{
    try {
        const allCourses = await Course.find({}, {courseName:true, courseDescription:true, price:true, thumbnail:true, instructor:true,
            ratingsAndReviews:true,studentsEnrolled:true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message: "courses fetched successfully",
            data: allCourses,
        })


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "Error while fetching Course",
            error:error.message
        })
    }
}

export const getCourseDetails = async (req,res)=>{
    try {
        const {courseId} = req.body;
        
        const courseDetails = await Course.findById(courseId).populate({
            path: "instructor",
            populate: {
                path: "additionalsDetails",
            }
        })
        .populate("category")
        .populate("ratingsAndReviews")
        .populate({
            path: "courseContent",
            populate:{
                path: "subSection",
            }
        })
        .exec();

        if(!courseDetails){
            return res.status(401).json({
                success:false,
                message: "Course details not found"
            })
        }
        return res.status(200).json({
                success:true,
                message: "Course details fetched successfully",
                data:courseDetails,
            })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "Error while fetching Course Details",
            error:error.message
        })
    }
}

export const getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}

export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}