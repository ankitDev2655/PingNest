import { startSendOtpConsumer } from "./config/consumer.js";
import "./config/env.js";
import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check route (good practice)
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});


// ✅ Proper startup function
const startServer = async () => {
    try {

        await startSendOtpConsumer();

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1); // stop app if critical services fail
    }
};

startServer();