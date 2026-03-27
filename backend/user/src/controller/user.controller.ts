import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { redisClient } from "../config/redis.js";
import TryCatch from "../config/tryCatch.js";
import type { AuthRequest } from "../middlewares/isAuth.js";
import User from "../model/user.model.js";

import { apiError } from "../utils/appError.js";

export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw apiError("Email is required", 400);
    }

    const rateLimitKey = `otp:login_attempts:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);

    if (rateLimit) {
        throw apiError(
            "Too many login attempts. Please try again later.",
            429
        );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;

    await redisClient.setEx(otpKey, 300, otp);

    await redisClient.set(rateLimitKey, "true", {
        EX: 60,
    });

    const message = {
        to: email,
        subject: "Your OTP for PingNest Login",
        body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await publishToQueue("send_otp_queue", message);

    res.status(200).json({
        success: true,
        message: "OTP sent to email",
    });
});


export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;

    if (!email || !enteredOtp) {
        throw apiError("Email and OTP are required", 400);
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp || storedOtp !== enteredOtp) {
        throw apiError("Invalid or expired OTP", 400);
    }

    await redisClient.del(otpKey);

    let user = await User.findOne({ email });

    if (!user) {
        const name = email.slice(0, email.indexOf("@"));
        user = await User.create({ email, name });
    }

    const token = generateToken(user.id);

    res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user,
    });
});


export const myProfile = TryCatch(async (req: AuthRequest, res) => {
    if (!req.user) {
        throw apiError("User not found", 404);
    }

    res.status(200).json({
        success: true,
        user: req.user,
    });
});


export const updateName = TryCatch(async (req: AuthRequest, res) => {
    if (!req.user) {
        throw apiError("Not authenticated", 401);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw apiError("User not found", 404);
    }

    const { name } = req.body;

    if (!name) {
        throw apiError("Name is required", 400);
    }

    user.name = name;
    await user.save();

    const token = generateToken(user.id);

    res.status(200).json({
        success: true,
        message: "Name updated successfully",
        token,
        user,
    });
});


export const getAllUsers = TryCatch(async (req: AuthRequest, res)=>{
    const users = await User.find();

    if(users.length === 0){
        throw apiError("No users found", 404);
    }

    res.status(200).json({
        success: true,
        count: users.length,
        users,
    });
})


export const getUserById = TryCatch(async (req, res)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        throw apiError("User not found", 404);
    }
    
    res.status(200).json({
        success: true,
        user,
    });
});
