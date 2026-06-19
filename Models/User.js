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
});


// method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    if (!this.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});

export default mongoose.model("User", UserSchema);