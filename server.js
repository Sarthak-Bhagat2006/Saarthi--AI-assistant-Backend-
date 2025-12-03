import 'dotenv/config';
import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from './Routes/chat.js';
import registerRoutes from "./Routes/user.js";

const app = express();

// Use PORT provided by Render
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());

// CORS

const allowedOrigins = [
    "https://saarthi-ai-assistant-frontend.vercel.app", // production frontend
    "http://localhost:3000" // local frontend
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow tools like Postman
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "CORS blocked: Origin not allowed";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // required if you use cookies/session
}));

// Routes
app.use('/api/auth', registerRoutes);
app.use('/api', chatRoutes);

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL;
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");
    } catch (error) {
        console.error("Failed to connect to DB:", error);
        process.exit(1); // Exit process if DB connection fails
    }
};

// Start server after DB connection
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Server failed to start:", err);
});
