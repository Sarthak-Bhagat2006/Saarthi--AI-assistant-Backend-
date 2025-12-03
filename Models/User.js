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
UserSchema.pre("save", async function () {
    // Skip if no password
    if (!this.password) return;

    // Skip if password unchanged
    if (!this.isModified("password")) return;

    // Hash password
    this.password = await bcrypt.hash(this.password, 10);
});


// method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);