import express from "express";
import { deleteAccount, getEnrolledCourses, getUserAllDetails, instrustorDashboard, updateDisplayPicture, updateProfile } from "../controller/Profile.js";
import { auth, isInstructor } from "../middlewares/auth.js";

const router = express.Router();

router.delete("/delete-account",auth, deleteAccount);

router.put("/update-account",auth, updateProfile);

router.get("/get-user-details", auth ,getUserAllDetails);

router.get("/instrustor-dashboard", auth  , isInstructor, instrustorDashboard);

router.get("/get-enrolled-courses",auth, getEnrolledCourses);

router.put("/change-profile-picture", auth, updateDisplayPicture);




export default router