"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exceptionHandler = void 0;
const http_status_code_1 = require("./enum/http-status.code");
const error_messages_enum_1 = require("./enum/error-messages.enum");
const exceptionHandler = (error, req, res, _next // we won't be calling next() here
) => {
    const statusCode = error.statusCode || http_status_code_1.HTTPStatusCode.InternalServerError;
    const message = error.message || error_messages_enum_1.ErrorMessages.Generic;
    // logger
    return res.status(statusCode).send({ status: false, statusCode, message });
};
exports.exceptionHandler = exceptionHandler;
//# sourceMappingURL=exception.handler.js.map