import SubSection from "../models/SubSection.js";
import Section from "../models/Section.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import dotenv from "dotenv";
dotenv.config();

export const createSubSection = async (req, res) => {
    try {
        const {sectionId, title,timeDuration,description} = req.body;
        const video = req.files.videoFile;

        if(!sectionId || !title|| !timeDuration|| !description || !video){
            return res.status(401).json({
                success: false,
                message: "All fields required",
            })
        }

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME)

        const subSectionDetails = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadDetails.secure_url
        })
        // console.log(subSectionDetails);

        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push: {
                    subSection: subSectionDetails._id,
                }
            },
            {new:true},
        )

        return res.status(200).json({
            success:true,
            message:"subsection created successfully",
            updatedSection 
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while Creating subsection",
            error:error.message,
        })
    }
}


export const updateSubSection = async (req, res) => {
    try {
        const { title, timeDuration, description, subSectionId } = req.body;
        const video = req.files.videoFile;

        if (!title || !timeDuration || !description || !video|| !subSectionId) {
            return res.status(403).json({
                success: false,
                message: "All fields required",
            })
        }


        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);


        const updatedDetails = await SubSection.findByIdAndUpdate(
            subSectionId,
            { 
                title: title,
                timeDuration: timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url,
            },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            updatedDetails
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while updating SubSection",
            error: error.message
        })
    }
}


export const deleteSubSection = async (req,res)=>{
    try{
        const {subSectionId,sectionId} =  req.body;

        if(!subSectionId || !sectionId){
            return res.status(403).json({
                success: false,
                message: "All fields required",
            })
        }

        await SubSection.findByIdAndDelete(subSectionId);
        const updatedSection = await Section.findByIdAndUpdate(sectionId, {
            $pull: {
                subSection: subSectionId
            }
        }, {new: true});

        return res.status(200).json({
            success: true,
            message: "subsection deleted successfully",
            updatedSection
        })



    }catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while deleting SubSection",
            error: error.message
        })
    }
}