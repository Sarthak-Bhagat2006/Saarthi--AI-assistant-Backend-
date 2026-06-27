import express from "express";
import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import crypto from "crypto";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Brevo } = require("@getbrevo/brevo");

import bcrypt from "bcrypt";
import sendVerificationEmail from "../Utils/sendEmail.js";

const router = express.Router();

// SIGN UP
router.post("/signUp", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Username, email and password are required",
        });
    }

    try {
        let user = await User.findOne({ email });

        // ===========================
        // Existing User
        // ===========================
        if (user) {

            // Already verified
            if (user.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered",
                });
            }

            // Generate new OTP
            const otp = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            const hashedOTP = await bcrypt.hash(otp, 10);

            // Update user details
            user.username = username;
            user.password = password;
            user.verificationOTP = hashedOTP;
            user.verificationOTPExpire =
                Date.now() + 10 * 60 * 1000;

            await user.save();

            try {

                await sendVerificationEmail(email, otp);

            } catch (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to send verification email.",
                });

            }

            return res.status(200).json({
                success: true,
                message: "OTP resent successfully.",
                email,
            });

        }

        // ===========================
        // New User
        // ===========================

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const hashedOTP = await bcrypt.hash(otp, 10);

        user = await User.create({
            username,
            email,
            password,
            role: "user",
            authProvider: "local",
            isVerified: false,
            verificationOTP: hashedOTP,
            verificationOTPExpire:
                Date.now() + 10 * 60 * 1000,
        });

        try {

            await sendVerificationEmail(email, otp);

        } catch (err) {

            console.log(err);

            // Remove user if email sending fails
            await User.findByIdAndDelete(user._id);

            return res.status(500).json({
                success: false,
                message: "Failed to send verification email.",
            });

        }

        return res.status(201).json({
            success: true,
            message: "OTP sent successfully.",
            email: user.email,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});
// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "email, password required"
        });
    }

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
            authProvider: "guest",
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


// GOOGLE LOGIN
router.post("/google", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: "Authorization code required",
        });
    }

    try {
        const tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                    grant_type: "authorization_code",
                }),
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error(tokenData);
            return res.status(400).json({
                success: false,
                message: "Failed to exchange Google code",
            });
        }

        const { access_token } = tokenData;

        //Get user info from Google
        const userResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const googleUser = await userResponse.json();

        const { email, name, picture } = googleUser;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google email not found",
            });
        }

        //Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                username: name || email.split("@")[0],
                email,
                role: "user",
                authProvider: "google",
                isVerified: true,
            });
        }

        //Issue YOUR JWT
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
        console.error("Google Auth Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Google authentication failed",
        });
    }

});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate random token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Save token + expiry in DB
        user.resetPasswordToken = resetToken;

        user.resetPasswordExpire =
            Date.now() + 15 * 60 * 1000; // 15 mins

        await user.save();

        // Reset URL
        const resetURL =
            `http://localhost:5173/reset-password/${resetToken}`;

        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.sender = { name: "Saarthi", email: "sarthakbhagat2006@gmail.com" };
        sendSmtpEmail.to = [{ email: user.email }];
        sendSmtpEmail.subject = "Password Reset";
        sendSmtpEmail.htmlContent = `
                <h2>Password Reset</h2>
                <p>Click below link to reset password:</p>
                <a href="${resetURL}">${resetURL}</a>
            `;
        await apiInstance.sendTransacEmail(sendSmtpEmail);


        return res.status(200).json({
            success: true,
            message: "Reset email sent",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


router.post("/reset-password/:token", async (req, res) => {

    const { token } = req.params;

    const { password } = req.body;

    try {

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Update password
        user.password = password;

        // Remove reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.post("/resend-otp", async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    try {

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified",
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const hashedOTP = await bcrypt.hash(otp, 10);

        user.verificationOTP = hashedOTP;
        user.verificationOTPExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        await sendVerificationEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

});

router.post("/verify-email", async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required",
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified",
            });
        }

        if (!user.verificationOTPExpire || user.verificationOTPExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        const validOTP = await bcrypt.compare(
            otp,
            user.verificationOTP
        );

        if (!validOTP) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;

        await user.save();

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user,
            token,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
});


export default router;
