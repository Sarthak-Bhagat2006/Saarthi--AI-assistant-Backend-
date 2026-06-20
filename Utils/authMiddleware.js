import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    const token = req.headers.authorization?.split(" ")[1];


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("_id email role");

        if (!user) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        req.user = user; // attach user to request
        next(); //express middleware function
    } catch (error) {
        console.log("JWT Error:", error.message); // more descriptive
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
