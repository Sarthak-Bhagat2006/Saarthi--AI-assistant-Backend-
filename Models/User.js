import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            unique: true,
            sparse: true, // allows multiple guests with no email
            required: function () {
                return this.role === "user";
            }
        },

        password: {
            type: String,
            required: function () {
                return this.role === "user";
            },
            minlength: [8, "Password must be at least 8 characters long"]
        },

        role: {
            type: String,
            enum: ["guest", "user"],
            default: "guest"
        }
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