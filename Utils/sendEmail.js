import SibApiV3Sdk from "sib-api-v3-sdk";

const sendVerificationEmail = async (email, otp) => {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: "Saarthi", email: "sarthakbhagat2006@gmail.com" };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Verify Your Saarthi Account";
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
            <h2 style="color:#4F46E5;">Welcome to Saarthi 👋</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing:8px; color:#4F46E5; text-align:center;">${otp}</h1>
            <p>This OTP is valid for <b>10 minutes</b>.</p>
            <p>Regards,<br>Saarthi Team</p>
        </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Verification email sent successfully");
};

export default sendVerificationEmail;