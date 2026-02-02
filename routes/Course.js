import express from "express"
import { createCourse, getAllCourses, getCourseDetails,getInstructorCourses,editCourse, deleteCourse, getFullCourseDetails, buyCourseDummy,updateCourseProgress} from "../controller/Course.js";
import { auth, isAdmin, isInstructor, isStudent } from "../middlewares/auth.js";
import { createSection, deleteSection, updateSection } from "../controller/Section.js";
import { createSubSection, deleteSubSection, updateSubSection } from "../controller/SubSection.js";
import { createRating, getAllRating, getAvgRating } from "../controller/RatingAndReview.js";
import { categoryPageDetails, createCategory, showAllCategory } from "../controller/Category.js";

const router= express.Router();  



router.post("/create-course", auth, isInstructor, createCourse);
router.post("/edit-course", auth, isInstructor, editCourse);
router.delete("/delete-course", auth, isInstructor, deleteCourse);


router.post("/add-section", auth, isInstructor, createSection);
router.post("/update-section",auth ,isInstructor, updateSection);
router.post("/delete-section",auth, isInstructor, deleteSection);


router.post("/add-subsection",auth, isInstructor, createSubSection);
router.post("/update-subsection",auth, isInstructor, updateSubSection);
router.post("/delete-subsection",auth, isInstructor, deleteSubSection);

router.get("/get-all-courses", getAllCourses);
router.post("/get-course-details", getCourseDetails);
router.get("/all-instructor-courses", auth, isInstructor, getInstructorCourses);
router.post("/get-full-course-details-auth", auth, getFullCourseDetails);


router.post("/create-category", auth, isAdmin, createCategory);
router.get("/show-all-categories", showAllCategory);
router.post("/get-category-details",categoryPageDetails );

router.post("/create-rating", auth, isStudent, createRating);
router.get("/get-all-ratingandreviews", getAllRating);
router.get("/get-avg-rating", getAvgRating);

router.post("/buy-course-dummy", auth, buyCourseDummy);
router.post("/updateCourseProgress", auth, updateCourseProgress);


export default router