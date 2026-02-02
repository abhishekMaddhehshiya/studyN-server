import SubSection from "../models/SubSection.js";
import Section from "../models/Section.js";
import uploadVideoToCloudinary from "../utils/videoUploader.js";
import dotenv from "dotenv";
import secToDuration from "../utils/secToDuration.js";
dotenv.config();

export const createSubSection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body;
        const video = req.files.video;

        if (!sectionId || !title || !description || !video) {
            return res.status(401).json({
                success: false,
                message: "All fields required",
            })
        }

        const uploadDetails = await uploadVideoToCloudinary(video, process.env.FOLDER_NAME)
        const timeDuration = uploadDetails.duration
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
            { new: true },
        ).populate("subSection")

        return res.status(200).json({
            success: true,
            message: "subsection created successfully",
            updatedSection
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while Creating subsection",
            error: error.message,
        })
    }
}


export const updateSubSection = async (req, res) => {
    try {
        const { title, description, subSectionId, sectionId } = req.body
        const video = req.files?.video

        if (!subSectionId) {
            return res.status(403).json({
                success: false,
                message: "SubSection ID is required",
            })
        }

        const updateData = {}

        if (title) updateData.title = title
        if (description) updateData.description = description

        if (video) {
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            updateData.videoUrl = uploadDetails.secure_url
            updateData.timeDuration = uploadDetails.duration
        }

        const updatedDetails = await SubSection.findByIdAndUpdate(
            subSectionId,
            updateData,
            { new: true },
        );

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSection
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while updating SubSection",
            error: error.message
        })
    }
}


export const deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body;

        if (!subSectionId || !sectionId) {
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
        }, { new: true }).populate("subSection");

        return res.status(200).json({
            success: true,
            message: "subsection deleted successfully",
            data: updatedSection
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while deleting SubSection",
            error: error.message
        })
    }
}