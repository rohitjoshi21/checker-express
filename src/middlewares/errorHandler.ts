import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../types/CustomError';

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);

    const statusCode = err.statusCode || 500; // Default to 500 if no status code is provided
    const message = err.message || 'Internal Server Error';
    const errorType = err.errorType || 'NotDefined';
    if (errorType == 'ValidationError') {
        res.render('auth/signup', {
            error: message,
        });
    } else if (errorType == 'LoginError') {
        res.render('auth/login', {
            error: message,
        });
    } else {
        res.status(statusCode).json({
            success: false,
            error: {
                message,
                status: statusCode,
            },
        });
    }
};
