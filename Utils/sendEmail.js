import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_KEY,
            },
        });

        await transporter.sendMail({
            from: '"Saarthi" <sarthakbhagat2006@gmail.com>',
            to: email,
            subject: "Verify Your Saarthi Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
                    <h2 style="color:#4F46E5;">Welcome to Saarthi 👋</h2>
                    <p>Your verification code is:</p>
                    <h1 style="letter-spacing:8px; color:#4F46E5; text-align:center;">${otp}</h1>
                    <p>This OTP is valid for <b>10 minutes</b>.</p>
                    <p>Regards,<br>Saarthi Team</p>
                </div>
            `,
        });

        console.log("Verification email sent successfully");

    } catch (error) {
        console.error("Email Error:", error);
        throw new Error("Unable to send verification email");
    }
};

export default sendVerificationEmail;