import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({

    courseName: {type: String, required:true},
    courseDescription: {type:String, required: true},
    instructor: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    whatYouWillLearn: {
        type:String
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
        }
    ],
    ratingsAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingsAndReview"
        }
    ],
    price: {
        type:Number
    },
    thumbnail: {type:String},
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    tag: {type: String,required: true},
    studentsEnrolled: [
        {type: mongoose.Schema.Types.ObjectId, ref: "User"}
    ],

    instructions: {type:String, },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    }


})
const Course = mongoose.model("Course", courseSchema)
export default Course