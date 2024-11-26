export class CustomError extends Error {
    statusCode?: number;
    errorType?: string;

    constructor(message: string, statusCode: number = 500, errorType?: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errorType = errorType;
    }
}
