import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
    {
        username: { type: String },
        email: { type: String, unique: true, sparse: true }, // optional for guests
        password: { type: String }, // only for registered users
        role: { type: String, enum: ["guest", "user"], default: "guest" },
    },
    { timestamps: true }
);

// hash password before save
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);