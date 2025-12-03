import 'dotenv/config';
import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from './Routes/chat.js';
import registerRoutes from "./Routes/user.js";

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());

// Allow frontend origins
app.use(cors({
    origin: ["http://localhost:5173", "https://saarthi-ai-assistant-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Routes
app.use('/api', chatRoutes);
app.use('/api/auth', registerRoutes);

// Guest login route
app.post('/auth/guest', (req, res) => {
    res.json({ success: true, message: "Guest login successful" });
});

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");
    } catch (error) {
        console.log("Failed to connect", error);
    }
};

// Server Start
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
});