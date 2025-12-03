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

    'https://saarthi-ai-assistant-frontend.vercel.app',
    'https://saarthi-ai-assistant-frontend.vercel.app/',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow curl, Postman
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
