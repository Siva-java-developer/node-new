"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageNotFoundExceptionHandler = void 0;
const http_status_code_1 = require("./enum/http-status.code");
const error_messages_enum_1 = require("./enum/error-messages.enum");
const pageNotFoundExceptionHandler = (req, res, _next // we won't be calling next() here
) => {
    const statusCode = http_status_code_1.HTTPStatusCode.NotFound;
    const message = error_messages_enum_1.ErrorMessages.NotFound;
    // logger
    return res.status(http_status_code_1.HTTPStatusCode.NotFound).send({ status: false, statusCode, message });
};
exports.pageNotFoundExceptionHandler = pageNotFoundExceptionHandler;
//# sourceMappingURL=page-not-found.exception.js.map