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
        minlength: 8,
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
});


// method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);