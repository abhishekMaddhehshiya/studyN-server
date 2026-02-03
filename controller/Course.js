import Course from "../models/Course.js"
import Category from "../models/Category.js"
import User from "../models/User.js"
import Section from "../models/Section.js"
import SubSection from "../models/SubSection.js"
import uploadImageToCloudinary from "../utils/imageUploader.js"
import dotenv, { populate } from "dotenv";
import secToDuration from "../utils/secToDuration.js"
import CourseProgress from "../models/CourseProgress.js"
dotenv.config();

export const createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category, tag, status = 'Draft', instructions } = req.body;

    const thumbnail = req.files.thumbnailImage;

    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail || !tag || !status || !instructions) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      })

    }
    // console.log(tag);
    // console.log(instructions)
    const userId = req.user.id
    // console.log(userId)
    const instructorDetails = await User.findById(userId);
    // console.log("Instructor Details: ", instructorDetails);

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "instructor not found",
      })
    }

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category",
      })
    }
    const ntag = JSON.parse(tag)
    // console.log(ntag)
    const ninstructions = JSON.parse(instructions)
    // console.log(ninstructions)

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
      tag: ntag,
      status,
      instructions: ninstructions
    })



    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: newCourse._id,
        }
      },
      { new: true }
    )


    await Category.findByIdAndUpdate(
      category,
      {
        $push: {
          course: newCourse._id,
        }
      },
      { new: true }
    )


    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse
    })



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating Course",
      error: error.message
    })
  }

}


export const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({}, {
      courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
      ratingsAndReviews: true, studentsEnrolled: true,
    }).populate("instructor").exec();

    return res.status(200).json({
      success: true,
      message: "courses fetched successfully",
      data: allCourses,
    })



  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching Course",
      error: error.message
    })
  }
}

export const getCourseDetails = async (req, res) => {
  try {

    const { courseId } = req.body;

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
        populate: {
          path: "subSection",
        }
      })
      .exec();

    if (!courseDetails) {
      return res.status(401).json({
        success: false,
        message: "Course details not found"
      })
    }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = secToDuration(totalDurationInSeconds)
    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: { courseDetails, totalDuration },
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching Course Details",
      error: error.message
    })
  }
}



export const getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses1 = await Course.find({
      instructor: instructorId,
    }).populate({
      path: "courseContent",
      populate: {
        path: "subSection"
      }
    }).sort({ createdAt: -1 })

    const instructorCourses = instructorCourses1.map((course) => {
      let totalDuration1 = 0;
      course.courseContent.forEach(element => {
        element.subSection.forEach(ele => {
          totalDuration1 += parseFloat(ele.timeDuration);

        })
      });
      // console.log(totalDuration1)
      const totalDuration = secToDuration(totalDuration1)
      return {...course.toObject(), totalDuration}
    })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
   
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}

export const editCourse = async (req, res) => {
  try {
    const { courseId, ...updates } = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files?.thumbnailImage) {
    
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (key === "tag" || key === "instructions") {
        try {
          course[key] = JSON.parse(updates[key])
        } catch {
          return res.status(400).json({
            success: false,
            message: `${key} must be valid JSON`,
          })
        }
      } else {
        course[key] = updates[key]
      }

    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalsDetails",
        },
      })
      .populate("category")
      .populate("ratingsAndReviews")
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
   
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    await User.updateMany(
      { _id: { $in: studentsEnrolled } },
      { $pull: { courses: courseId } }
    )


    // Delete sections and sub-sections
    const sections = await Section.find({ _id: { $in: course.courseContent } })

    const subSectionIds = sections.flatMap(sec => sec.subSection)

    await SubSection.deleteMany({ _id: { $in: subSectionIds } })
    await Section.deleteMany({ _id: { $in: course.courseContent } })

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
 
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalsDetails",
        },
      })
      .populate("category")
      .populate("ratingsAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    })

    // console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = secToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const buyCourseDummy = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id;

  try {

    // Add userId to studentsEnrolled in each course
    await Course.updateMany(
      { _id: { $in: courses } },
      { $addToSet: { studentsEnrolled: userId } }
    );

    // Add all course ids to user's courses
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { courses: { $each: courses } } }
    );

    // Create CourseProgress for each course
    for (const courseId of courses) {
      await CourseProgress.create({
        courseId: courseId,
        userId: userId,
        completedVideos: []
      });
    }



    res.status(200).json({
      success: true,
      message: "Courses purchased successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to purchase courses",
    });
  }
}

export const updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ success: false, message: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    })

    if (!courseProgress) {
      // If course progress doesn't exist, create a new one
      return res.status(404).json({
        success: false,
        message: "Course progress Does Not Exist",
      })
    } else {
      // If course progress exists, check if the subsection is already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({ success: false, message: "Subsection already completed" })
      }

      // Push the subsection into the completedVideos array
      courseProgress.completedVideos.push(subsectionId)
    }

    // Save the updated course progress
    await courseProgress.save()

    return res.status(200).json({ success: true, message: "Course progress updated" })
  } catch (error) {
  
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}