import express from "express";
import "dotenv/config";
import { signUp, login, guest, google, forgotPassword, resetPassword } from "../Controllers/authControllers.js"
const router = express.Router();

// SIGN UP
router.post("/signUp", signUp);

// LOGIN
router.post("/login", login);

// GUEST LOGIN
router.post("/guest", guest);


// GOOGLE LOGIN
router.post("/google", google);

router.post("/forgot-password", forgotPassword);


router.post("/reset-password/:token", resetPassword);

export default router;