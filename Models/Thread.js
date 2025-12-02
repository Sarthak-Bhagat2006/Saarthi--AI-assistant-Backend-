import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },

        content: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

const ThreadSchema = new mongoose.Schema(
    {
        threadId: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String,
            default: "New Chat"
        },
        messages: [MessageSchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }  // automatically adds createdAt & updatedAt
);

export default mongoose.model("Thread", ThreadSchema);