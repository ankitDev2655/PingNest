import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("❌ REDIS_URL is not defined in environment variables");
}

export const redisClient = createClient({
    url: redisUrl,
});

// Handle Redis errors globally
redisClient.on("error", (err) => {
    console.error("❌ Redis Error:", err);
});

// Connect function (better control)
export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("✅ Connected to Redis");
    } catch (error) {
        console.error("❌ Redis Connection Failed:", error);
        process.exit(1); // stop app if Redis is critical
    }
};