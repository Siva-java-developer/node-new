class CustomError extends Error {
    statusCode: number;

    // Overload signatures
    constructor(message: string, statusCode?: number);
    constructor(statusCode: number, message?: string);

    // Single implementation signature (must be compatible with all overloads)
    constructor(messageOrStatusCode: string | number, statusCodeOrMessage?: number | string) {
        if (typeof messageOrStatusCode === 'string') {
            super(messageOrStatusCode);
            this.message = messageOrStatusCode;
            this.statusCode = typeof statusCodeOrMessage === 'number' ? statusCodeOrMessage : 500;
        } else {
            const message = typeof statusCodeOrMessage === 'string' ? statusCodeOrMessage : 'Not Found';
            super(message);
            this.message = message;
            this.statusCode = messageOrStatusCode;
        }

        // Set the prototype explicitly (required for extending built-ins)
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export default CustomError;
