import mongoose from "mongoose";

const ratingsAndReviewSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, required:true, ref: "User"},
    course: {type: mongoose.Schema.Types.ObjectId, required:true, ref: "Course",index:true},
    rating: {type:Number, required: true},
    review: {type:String, required: true},

})

const RatingsAndReview = mongoose.model("RatingsAndReview",ratingsAndReviewSchema)
export default RatingsAndReview