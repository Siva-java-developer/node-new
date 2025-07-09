"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../model/user.model"));
const config_1 = __importDefault(require("../config"));
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
/**
 * Middleware to protect routes - verifies JWT token and attaches user to request
 */
exports.protect = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check if token exists
    if (!token) {
        throw new custom_error_1.default('Not authorized to access this route', http_status_code_1.HTTPStatusCode.Unauthorized);
    }
    try {
        // Verify token using RSA public key
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.publicKey, {
            algorithms: [config_1.default.jwt.algorithm]
        });
        // Get user from database
        const user = yield user_model_1.default.findById(decoded.id);
        if (!user) {
            throw new custom_error_1.default('User not found', http_status_code_1.HTTPStatusCode.Unauthorized);
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        throw new custom_error_1.default('Not authorized to access this route', http_status_code_1.HTTPStatusCode.Unauthorized);
    }
}));
/**
 * Middleware to restrict access based on user role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            throw new custom_error_1.default(`User role ${user.role} is not authorized to access this route`, http_status_code_1.HTTPStatusCode.Forbidden);
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map