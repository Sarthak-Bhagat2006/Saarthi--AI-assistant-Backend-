
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
import cors from 'cors';

const allowedOrigins = [
    'https://saarthi-ai-assistant-frontend.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin like mobile apps or curl
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Routes
app.use('/api', chatRoutes);
app.use('/api/auth', registerRoutes);

const MONGO_URL = process.env.MONGO_URL;
// MongoDB Connection
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

