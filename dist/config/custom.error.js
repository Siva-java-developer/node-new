"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    // Single implementation signature (must be compatible with all overloads)
    constructor(messageOrStatusCode, statusCodeOrMessage) {
        if (typeof messageOrStatusCode === 'string') {
            super(messageOrStatusCode);
            this.message = messageOrStatusCode;
            this.statusCode = typeof statusCodeOrMessage === 'number' ? statusCodeOrMessage : 500;
        }
        else {
            const message = typeof statusCodeOrMessage === 'string' ? statusCodeOrMessage : 'Not Found';
            super(message);
            this.message = message;
            this.statusCode = messageOrStatusCode;
        }
        // Set the prototype explicitly (required for extending built-ins)
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.default = CustomError;
//# sourceMappingURL=custom.error.js.map