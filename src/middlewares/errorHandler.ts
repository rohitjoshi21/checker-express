import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);

    const statusCode = err.status || 500; // Default to 500 if no status code is provided
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            status: statusCode,
        },
    });
};
