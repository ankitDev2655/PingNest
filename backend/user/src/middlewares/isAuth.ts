import type { Request, Response, NextFunction } from "express";
import type { IUser } from "../model/user.model.js";
import User from "../model/user.model.js";
import { verifyToken } from "../config/generateToken.js";
import { apiError } from "../utils/appError.js";

export interface AuthRequest extends Request {
    user?: IUser;
}

export const isAuthenticated = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(apiError("Unauthorized", 401));
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return next(apiError("Token not found", 401));
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(apiError("User not found", 404));
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};