"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const typedi_1 = require("typedi");
const token_utils_1 = require("../utils/token.utils");
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
let AuthService = class AuthService {
    /**
     * Get logged-in user from token
     * @param token JWT token string or Authorization header value
     * @returns User object
     * @throws CustomError if token is invalid or user not found
     */
    getLoggedInUser(token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if token is an Authorization header
            const extractedToken = token.startsWith('Bearer ')
                ? token_utils_1.TokenUtils.extractTokenFromHeader(token)
                : token;
            if (!extractedToken) {
                throw new custom_error_1.default('No token provided', http_status_code_1.HTTPStatusCode.Unauthorized);
            }
            // Get user from token
            return yield token_utils_1.TokenUtils.getUserFromToken(extractedToken);
        });
    }
    /**
     * Get logged-in user ID from token
     * @param token JWT token string or Authorization header value
     * @returns User ID
     * @throws CustomError if token is invalid
     */
    getLoggedInUserId(token) {
        // Check if token is an Authorization header
        const extractedToken = token.startsWith('Bearer ')
            ? token_utils_1.TokenUtils.extractTokenFromHeader(token)
            : token;
        if (!extractedToken) {
            throw new custom_error_1.default('No token provided', http_status_code_1.HTTPStatusCode.Unauthorized);
        }
        // Get user ID from token
        return token_utils_1.TokenUtils.getUserIdFromToken(extractedToken);
    }
    /**
     * Check if user has required role
     * @param token JWT token string or Authorization header value
     * @param requiredRoles Array of allowed roles
     * @returns Boolean indicating if user has required role
     * @throws CustomError if token is invalid
     */
    hasRole(token, requiredRoles) {
        // Check if token is an Authorization header
        const extractedToken = token.startsWith('Bearer ')
            ? token_utils_1.TokenUtils.extractTokenFromHeader(token)
            : token;
        if (!extractedToken) {
            throw new custom_error_1.default('No token provided', http_status_code_1.HTTPStatusCode.Unauthorized);
        }
        // Get user role from token
        const userRole = token_utils_1.TokenUtils.getUserRoleFromToken(extractedToken);
        // Check if user has required role
        return requiredRoles.includes(userRole);
    }
};
AuthService = __decorate([
    (0, typedi_1.Service)()
], AuthService);
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map