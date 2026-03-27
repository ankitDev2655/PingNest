export interface AppErrorType extends Error {
    statusCode: number;
}

export const apiError = (
    message: string,
    statusCode: number
): AppErrorType => {
    const error = new Error(message) as AppErrorType;
    error.statusCode = statusCode;
    return error;
};