import Course from "../models/Course.js";
import Section from "../models/Section.js";


export const createSection = async (req, res) => {
    try {

        const { sectionName, courseId } = req.body;

        if (!sectionName || !courseId) {
            return res.status(403).json({
                success: false,
                message: "All fields required",
            })
        }

        const newSection = await Section.create({ sectionName })

        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            },
            { new: true }
        ).populate({
            path: "courseContent",
            populate:{
                path: "subSection",
            }
        })

        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while creating Section",
            error: error.message
        })
    }
}


export const updateSection = async (req, res) => {
    try {
        const { sectionName, sectionId } = req.body;
        if (!sectionId || !sectionName) {
            return res.status(403).json({
                success: false,
                message: "All fields required",
            })
        }

        const updatedDetails = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName: sectionName },
            { new: true }
        ).populate("subSection");
        

        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            updatedDetails
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while updating Section",
            error: error.message
        })
    }
}


export const deleteSection = async (req,res)=>{
    try{
        const {sectionId,courseId} =  req.body;

        if(!sectionId || !courseId){
            return res.status(403).json({
                success: false,
                message: "All fields required",
            })
        }

        await Section.findByIdAndDelete(sectionId);

        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            }
        }, {new: true}).populate({
            path: "courseContent",
            populate:{
                path: "subSection",
            }
        })


        return res.status(200).json({
            success: true,
            message: "section deleted successfully",
            updatedCourse,
        })



    }catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while deleting Section",
            error: error.message
        })
    }
}