"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.TokenUtils = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../model/user.model"));
const config_1 = __importDefault(require("../config"));
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
const user_dto_1 = __importDefault(require("../dto/user.dto"));
/**
 * Utility class for token operations
 */
class TokenUtils {
    /**
     * Extract and verify JWT token
     * @param token JWT token string
     * @returns Decoded JWT payload
     * @throws CustomError if token is invalid
     */
    static verifyToken(token) {
        try {
            // Verify token using RSA public key
            const decoded = jwt.verify(token, config_1.default.jwt.publicKey, {
                algorithms: [config_1.default.jwt.algorithm]
            });
            return decoded;
        }
        catch (error) {
            throw new custom_error_1.default('Invalid or expired token', http_status_code_1.HTTPStatusCode.Unauthorized);
        }
    }
    /**
     * Extract token from Authorization header
     * @param authHeader Authorization header value
     * @returns Token string or null if not found
     */
    static extractTokenFromHeader(authHeader) {
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }
        return null;
    }
    /**
     * Get user from token
     * @param token JWT token string
     * @returns User object
     * @throws CustomError if token is invalid or user not found
     */
    static getUserFromToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = this.verifyToken(token);
            // Get user from database
            const user = yield user_model_1.default.findById(decoded.id);
            if (!user) {
                throw new custom_error_1.default('User not found', http_status_code_1.HTTPStatusCode.Unauthorized);
            }
            return user_dto_1.default.toResponse(user);
        });
    }
    /**
     * Get user ID from token
     * @param token JWT token string
     * @returns User ID
     * @throws CustomError if token is invalid
     */
    static getUserIdFromToken(token) {
        const decoded = this.verifyToken(token);
        return decoded.id;
    }
    /**
     * Get user role from token
     * @param token JWT token string
     * @returns User role
     * @throws CustomError if token is invalid
     */
    static getUserRoleFromToken(token) {
        const decoded = this.verifyToken(token);
        return decoded.role;
    }
}
exports.TokenUtils = TokenUtils;
//# sourceMappingURL=token.utils.js.map