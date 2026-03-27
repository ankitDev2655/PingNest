import type { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, any>;
    path?: string;
}

const errorMiddleware = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // 🔹 Mongoose Bad ObjectId
    if (err.name === "CastError") {
        message = `Resource not found. Invalid: ${(err as any).path}`;
        statusCode = 400;
    }

    // 🔹 Duplicate key error
    if (err.code === 11000 && err.keyValue) {
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: ${field}`;
        statusCode = 400;
    }

    // 🔹 JWT errors
    if (err.name === "JsonWebTokenError") {
        message = "Invalid token";
        statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorMiddleware;