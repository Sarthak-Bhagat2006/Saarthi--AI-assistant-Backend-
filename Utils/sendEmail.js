import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send OTP verification email
 * @param {string} email
 * @param {string} otp
 */

const sendVerificationEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"Saarthi" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Saarthi Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
                    <h2 style="color:#4F46E5;">Welcome to Saarthi 👋</h2>

                    <p>Thank you for signing up.</p>

                    <p>Your verification code is:</p>

                    <h1 style="
                        letter-spacing:8px;
                        color:#4F46E5;
                        text-align:center;
                    ">
                        ${otp}
                    </h1>

                    <p>This OTP is valid for <b>10 minutes</b>.</p>

                    <p>If you didn't create this account, simply ignore this email.</p>

                    <br>

                    <p>Regards,<br>Saarthi Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        console.log("Verification email sent successfully");
    } catch (error) {
        console.error("Email Error:", error.message);
        throw new Error("Unable to send verification email");
    }
};

export default sendVerificationEmail;