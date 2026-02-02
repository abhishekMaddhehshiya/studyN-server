import mongoose from "mongoose";
import Course from "../models/Course.js";
import RatingsAndReview from "../models/RatingAndReview.js"

export const createRating = async (req,res)=>{
    try {
        const userId = req.user.id;

        const {rating, review, courseId} = req.body;
        const courseDetails = await Course.findOne({_id: courseId, studentsEnrolled: {
            $elemMatch:{$eq: userId}
        }});

        if(!courseDetails){
            return res.status(402).json({
                success:false,
                message: "student is not enrolled in the course"
            })
        }

        const alreadyReviewed = await RatingsAndReview.findOne({
            user:userId,
            course: courseId,
        })

        if(alreadyReviewed){
            return res.status(400).json({
                success:false,
                message: "User already reviewed the course",
            })
        }

        const ratingReview = await RatingsAndReview.create({
            user: userId,
            course: courseId,
            rating: rating,
            review:review
        })

        const newCourseDetails = await Course.findOneAndUpdate({_id:courseId} , {
            $push: {
                ratingsAndReviews: ratingReview._id,
            }
        }, {new: true})
        console.log(newCourseDetails);
        return res.status(200).json({
                success:true,
                message: "rating and review create successfully",
                ratingReview,
                
        })

        
    } catch (error) {
        return res.status(500).json({
                success:false,
                message: "Error while creating ratings",
                error: error.message,
        })
    }
}


export const getAvgRating = async (req,res)=>{
    try {
        const {courseId} = req.body;

        const result = await RatingsAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Schema.Types.ObjectId(courseId),
                }, 

            }, 
            {
                $group: {
                    _id:null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])

        
        if(result.length() > 0){
            return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
            })

        }
        return res.status(200).json({
                success:true,
                message: "No rating given till now",
                averageRating: 0
        })
        
    } catch (error) {
        return res.status(500).json({
                success:false,
                message: "Error while getting avg ratings",
                error: error.message,
        })
    }
}

export const getAllRating = async(req,res)=>{
    try {

        const allReviews = await RatingsAndReview.find({})
                                            .sort({rating: "desc"})
                                            .limit(10)
                                            .populate({
                                                path: "user",
                                                select: "firstName lastName email image"
                                            })
                                            .populate({path: "course", select: "courseName"})
                                            .exec();

        return res.status(200).json({
            success:true,
            message: "All reviews fetched successfully",
            data: allReviews
        })
        
    } catch (error) {
        return res.status(500).json({
                success:false,
                message: "Error while getting all ratings",
                error: error.message,
        })
    }
}