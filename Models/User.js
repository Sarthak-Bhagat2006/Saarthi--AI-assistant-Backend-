import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        unique: true,
        sparse: true,
        required: function () {
            return this.authProvider !== "guest";
        },
    },

    password: {
        type: String,
        required: function () {
            return this.authProvider === "local";
        },
    },

    authProvider: {
        type: String,
        enum: ["local", "google", "guest"],
        default: "guest",
    },

    role: {
        type: String,
        enum: ["guest", "user"],
        default: "guest",
    },
    resetPasswordToken: {
        type: String,
    },

    resetPasswordExpire: {
        type: Date,
    },
    verificationOTP: {
        type: String,
    },

    verificationOTPExpire: {
        type: Date,
    },

    isVerified: {
        type: Boolean,
        default: function () {
            return this.authProvider !== "local";
        },
    },
});


// method to compare password
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare entered password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }

    return await bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.model("User", UserSchema);