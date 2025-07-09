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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jwt = __importStar(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../model/user.model"));
const config_1 = __importDefault(require("../config"));
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
const auth_service_1 = __importDefault(require("../service/auth.service"));
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
        /**
         * Register a new user
         */
        this.register = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, username, email, password, age, gender, mobileNumber, role, class: userClass, syllabus } = request.body;
            // Get profile image path from file if uploaded
            const profileImage = request.file ? request.file.path.replace(/\\/g, '/') : undefined;
            // Validate required fields
            if (!firstName || !lastName || !username || !email || !password || !age || !gender || !mobileNumber || !role || !syllabus) {
                throw new custom_error_1.default('Please provide all required fields', http_status_code_1.HTTPStatusCode.BadRequest);
            }
            // Check if user already exists
            const existingUser = yield user_model_1.default.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                throw new custom_error_1.default('User already exists with this email or username', http_status_code_1.HTTPStatusCode.BadRequest);
            }
            // Generate UID
            const generateUID = () => {
                return Math.random().toString(36).substring(2, 12);
            };
            // Create new user (class and profileImage are optional)
            const user = yield user_model_1.default.create(Object.assign(Object.assign({ firstName,
                lastName,
                username,
                email,
                password,
                age,
                gender,
                mobileNumber,
                role,
                syllabus, uid: generateUID() }, (userClass && { class: userClass })), (profileImage && { profileImage })));
            // Generate JWT token with username and role
            const token = this.generateToken(user);
            // Return user data (without password) and token
            return response.status(http_status_code_1.HTTPStatusCode.Created).json({
                status: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        email: user.email,
                        age: user.age,
                        gender: user.gender,
                        mobileNumber: user.mobileNumber,
                        role: user.role,
                        class: user.class,
                        uid: user.uid,
                        syllabus: user.syllabus,
                        profileImage: user.profileImage
                    },
                    token
                }
            });
        }));
        /**
         * Login user
         */
        this.login = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            // Check if email and password are provided
            if (!email || !password) {
                throw new custom_error_1.default('Please provide email and password', http_status_code_1.HTTPStatusCode.BadRequest);
            }
            // Find user by email and include password field
            const user = yield user_model_1.default.findOne({ email }).select('+password');
            // Check if user exists and password is correct
            if (!user || !(yield user.comparePassword(password))) {
                throw new custom_error_1.default('Invalid credentials', http_status_code_1.HTTPStatusCode.Unauthorized);
            }
            // Generate JWT token with username and role
            const token = this.generateToken(user);
            // Return user data (without password) and token
            return response.status(http_status_code_1.HTTPStatusCode.Ok).json({
                status: true,
                message: 'Login successful',
                data: {
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        email: user.email,
                        age: user.age,
                        gender: user.gender,
                        mobileNumber: user.mobileNumber,
                        role: user.role,
                        class: user.class,
                        uid: user.uid,
                        syllabus: user.syllabus,
                        profileImage: user.profileImage
                    },
                    token
                }
            });
        }));
        /**
         * Get current user profile
         */
        this.getProfile = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            // User is already attached to request by the auth middleware
            const user = request.user;
            return response.status(http_status_code_1.HTTPStatusCode.Ok).json({
                status: true,
                data: user
            });
        }));
        /**
         * Get current user profile using token (for internal API calls)
         */
        this.getProfileFromToken = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { token } = request.body;
            if (!token) {
                throw new custom_error_1.default('Token is required', http_status_code_1.HTTPStatusCode.BadRequest);
            }
            try {
                // Get user from token using auth service
                const user = yield this.authService.getLoggedInUser(token);
                return response.status(http_status_code_1.HTTPStatusCode.Ok).json({
                    status: true,
                    data: user
                });
            }
            catch (error) {
                throw new custom_error_1.default('Invalid or expired token', http_status_code_1.HTTPStatusCode.Unauthorized);
            }
        }));
    }
    /**
     * Generate JWT token
     */
    generateToken(user) {
        const privateKey = config_1.default.jwt.privateKey;
        const options = {
            expiresIn: config_1.default.jwt.expiresIn,
            algorithm: config_1.default.jwt.algorithm
        };
        // Include id, username, and role in the token payload
        return jwt.sign({
            id: user._id,
            username: user.username,
            role: user.role
        }, privateKey, options);
    }
};
AuthController = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [auth_service_1.default])
], AuthController);
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map