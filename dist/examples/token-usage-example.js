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
exports.extractTokenFromRequestExample = exports.apiEndpointExample = exports.authServiceExample = exports.directTokenUsageExample = void 0;
const token_utils_1 = require("../utils/token.utils");
const auth_service_1 = __importDefault(require("../service/auth.service"));
const typedi_1 = __importDefault(require("typedi"));
const axios_1 = __importDefault(require("axios"));
/**
 * Example of how to use the token utilities directly
 */
function directTokenUsageExample(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract user ID from token
            const userId = token_utils_1.TokenUtils.getUserIdFromToken(token);
            console.log('User ID:', userId);
            // Extract user role from token
            const userRole = token_utils_1.TokenUtils.getUserRoleFromToken(token);
            console.log('User Role:', userRole);
            // Get full user object from token
            const user = yield token_utils_1.TokenUtils.getUserFromToken(token);
            console.log('User:', user);
            return user;
        }
        catch (error) {
            console.error('Error processing token:', error);
            throw error;
        }
    });
}
exports.directTokenUsageExample = directTokenUsageExample;
/**
 * Example of how to use the auth service
 */
function authServiceExample(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get auth service from container
            const authService = typedi_1.default.get(auth_service_1.default);
            // Get user from token
            const user = yield authService.getLoggedInUser(token);
            console.log('User from Auth Service:', user);
            // Get user ID from token
            const userId = authService.getLoggedInUserId(token);
            console.log('User ID from Auth Service:', userId);
            // Check if user has admin role
            const isAdmin = authService.hasRole(token, ['admin']);
            console.log('Is Admin:', isAdmin);
            return user;
        }
        catch (error) {
            console.error('Error using auth service:', error);
            throw error;
        }
    });
}
exports.authServiceExample = authServiceExample;
/**
 * Example of how to use the API endpoint
 */
function apiEndpointExample(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Call the API endpoint
            const response = yield axios_1.default.post('http://localhost:3000/v1/auth/profile/token', {
                token
            });
            console.log('User from API:', response.data.data);
            return response.data.data;
        }
        catch (error) {
            console.error('Error calling API:', error);
            throw error;
        }
    });
}
exports.apiEndpointExample = apiEndpointExample;
/**
 * Example of how to extract token from request headers
 */
function extractTokenFromRequestExample(authorizationHeader) {
    // Extract token from Authorization header
    const token = token_utils_1.TokenUtils.extractTokenFromHeader(authorizationHeader);
    if (!token) {
        console.error('No token found in header');
        return null;
    }
    console.log('Extracted Token:', token);
    return token;
}
exports.extractTokenFromRequestExample = extractTokenFromRequestExample;
//# sourceMappingURL=token-usage-example.js.map