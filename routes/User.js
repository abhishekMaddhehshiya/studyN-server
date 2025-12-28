import express from 'express'
import { changePassword, login, signup } from '../controller/Auth.js';
import { auth } from '../middlewares/auth.js';


const router = express.Router();

router.post("/signup", signup);

router.post("/signin", login);

router.post("/change-password",auth, changePassword);



export default router;
