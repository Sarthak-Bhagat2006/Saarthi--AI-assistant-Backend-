import express from 'express';
import Thread from '../Models/Thread.js';
import getAPIResponce from '../Utils/apiResponce.js';
import { authMiddleware } from "../Utils/authMiddleware.js";

const router = express.Router();

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

//test
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "123w",
            title: "test chat"
        });

        const resp = await thread.save();
        res.status(200).json({ message: "Thread saved successfully", data: resp });

    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Failed to save in DB" })
    }
})

//GET all threads

router.get("/thread", authMiddleware, async (req, res) => {
    try {
        //Sort in descending order 
        const threads = await Thread.find({ createdBy: req.user._id }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: " Failed to fetch threads " });
    }
});

router.get("/thread/:threadId", authMiddleware, async (req, res) => {

    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId, createdBy: req.user._id });

        if (!thread) {
            res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: " Failed to fetch threads " });
    }
});

router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    try {
        const deleteThread = await Thread.findOneAndDelete({ threadId, createdBy: req.user._id });
        if (!deleteThread) {
            res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ success: "Thread deleted successfully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});


// Chat
router.post("/chat", authMiddleware, async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            thread = new Thread({
                threadId,
                title: message,
                messages: [{ role: "user", content: message }],
                createdBy: req.user._id,  // always valid
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getAPIResponce(message);
        thread.messages.push({ role: "assistant", content: assistantReply });

        thread.updatedAt = new Date();
        await thread.save();

        res.json({ reply: assistantReply });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;