import express from "express";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const router = express.Router();

// SIGN UP
router.post("/signUp", async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Signup request body:", req.body);

    try {
        const isUser = await User.findOne({ email });

        if (isUser) {
            return res.status(400).json({
                success: false,
                message: "User email already registered",
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: "user",
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// GUEST LOGIN
router.post("/guest", async (req, res) => {
    try {
        const guestUser = await User.create({
            username: `Guest-${uuidv4()}`,
            role: "guest",
        });

        const token = jwt.sign(
            { id: guestUser._id, role: "guest" },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        return res.json({
            success: true,
            user: guestUser,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
