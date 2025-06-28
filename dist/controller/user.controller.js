"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const user_service_1 = __importDefault(require("../service/user.service"));
const typedi_1 = require("typedi");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const http_status_code_1 = require("../config/enum/http-status.code");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const user_dto_1 = require("../dto/user.dto");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
        this.addUser = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const generateUID = () => {
                return Math.random().toString(36).substring(2, 12);
            };
            const userData = {
                firstName: request.body.firstName,
                lastName: request.body.lastName,
                username: request.body.username,
                email: request.body.email,
                password: request.body.password,
                age: request.body.age,
                gender: request.body.gender,
                mobileNumber: request.body.mobileNumber,
                role: request.body.role,
                class: request.body.class,
                syllabus: request.body.syllabus,
                uid: generateUID()
            };
            // Handle profile image if uploaded
            if (request.file) {
                const fileName = request.file.filename;
                const filePath = `/uploads/Profiles/${fileName}`;
                userData.profileImage = filePath;
            }
            yield this.userService.createUser(userData);
            return response.json({ status: true, message: "User saved" });
        }));
        this.getUser = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userService.getUsers();
            return response.json({ status: true, data: users });
        }));
        this.getUserById = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = request.params.id;
            const user = yield this.userService.getUserById(userId);
            return response.json({ status: true, data: user });
        }));
        this.updateUser = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = request.params.id;
            const userData = {
                firstName: request.body.firstName,
                lastName: request.body.lastName,
                username: request.body.username,
                email: request.body.email,
                age: request.body.age,
                gender: request.body.gender,
                mobileNumber: request.body.mobileNumber,
                role: request.body.role,
                class: request.body.class,
                syllabus: request.body.syllabus
            };
            // Handle profile image if uploaded
            if (request.file) {
                const fileName = request.file.filename;
                const filePath = `/uploads/Profiles/${fileName}`;
                userData.profileImage = filePath;
                // If replacing an existing profile image, delete the old one
                const user = yield this.userService.getUserById(userId);
                if (user && user.profileImage) {
                    try {
                        const oldImagePath = user.profileImage.split('/').pop(); // Get filename from path
                        if (oldImagePath) {
                            const fullPath = path_1.default.join(__dirname, '..', 'uploads', 'Profiles', oldImagePath);
                            if (fs_1.default.existsSync(fullPath)) {
                                fs_1.default.unlinkSync(fullPath);
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error deleting old profile image:', error);
                        // Continue with update even if old image deletion fails
                    }
                }
            }
            yield this.userService.updateUser(userId, userData);
            return response.json({ status: true, message: "User updated" });
        }));
        this.deleteUser = (0, express_async_handler_1.default)((request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = request.params.id;
            // Get user to check if they have a profile image
            try {
                const user = yield this.userService.getUserById(userId);
                if (user && user.profileImage) {
                    const imagePath = user.profileImage.split('/').pop(); // Get filename from path
                    if (imagePath) {
                        const fullPath = path_1.default.join(__dirname, '..', 'uploads', 'Profiles', imagePath);
                        if (fs_1.default.existsSync(fullPath)) {
                            fs_1.default.unlinkSync(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error deleting profile image during user deletion:', error);
                // Continue with user deletion even if image deletion fails
            }
            yield this.userService.deleteUser(userId);
            return response.json({ status: true, message: "User deleted" });
        }));
        // Profile image download functionality
        /**
         * @swagger
         * /v1/user/{userId}/profile-image:
         *   get:
         *     summary: Download user profile image by user ID
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: User ID
         *     responses:
         *       200:
         *         description: Profile image file
         *         content:
         *           image/jpeg:
         *             schema:
         *               type: string
         *               format: binary
         *           image/png:
         *             schema:
         *               type: string
         *               format: binary
         *           image/gif:
         *             schema:
         *               type: string
         *               format: binary
         *           image/webp:
         *             schema:
         *               type: string
         *               format: binary
         *       404:
         *         description: User or image not found
         *       500:
         *         description: Internal server error
         */
        this.downloadProfileImageByUserId = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                    success: false,
                    message: 'User ID is required'
                });
            }
            try {
                // Get user to find their profile image
                const user = yield this.userService.getUserById(userId);
                if (!user) {
                    return res.status(http_status_code_1.HTTPStatusCode.NotFound).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                if (!user.profileImage) {
                    return res.status(http_status_code_1.HTTPStatusCode.NotFound).json({
                        success: false,
                        message: 'User has no profile image'
                    });
                }
                // Extract filename from the profile image path
                const filename = user.profileImage.split('/').pop();
                if (!filename) {
                    return res.status(http_status_code_1.HTTPStatusCode.NotFound).json({
                        success: false,
                        message: 'Invalid profile image path'
                    });
                }
                const filePath = path_1.default.join(__dirname, '..', 'uploads', 'Profiles', filename);
                // Check if file exists
                if (!fs_1.default.existsSync(filePath)) {
                    return res.status(http_status_code_1.HTTPStatusCode.NotFound).json({
                        success: false,
                        message: 'Profile image file not found'
                    });
                }
                // Get file stats to set proper headers
                const stat = fs_1.default.statSync(filePath);
                const fileExtension = path_1.default.extname(filename).toLowerCase();
                // Set content type based on file extension
                let contentType = 'application/octet-stream';
                switch (fileExtension) {
                    case '.jpg':
                    case '.jpeg':
                        contentType = 'image/jpeg';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.gif':
                        contentType = 'image/gif';
                        break;
                    case '.webp':
                        contentType = 'image/webp';
                        break;
                }
                // Set headers
                res.set({
                    'Content-Type': contentType,
                    'Content-Length': stat.size,
                    'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                    'Content-Disposition': `inline; filename="${filename}"`
                });
                // Create read stream and pipe to response
                const readStream = fs_1.default.createReadStream(filePath);
                readStream.pipe(res);
            }
            catch (error) {
                console.error('Error downloading profile image by user ID:', error);
                return res.status(http_status_code_1.HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: 'Failed to download profile image'
                });
            }
        }));
        /**
         * @swagger
         * /v1/user/{userId}/favorites:
         *   get:
         *     summary: Get user's favorite music
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the user
         *     responses:
         *       200:
         *         description: List of user's favorite music
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                   example: true
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/Music'
         *       404:
         *         description: User not found
         *       500:
         *         description: Internal server error
         */
        this.getUserFavorites = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            try {
                const favorites = yield this.userService.getUserFavoriteMusic(userId);
                const favoritesDTO = favorites.map(music => user_dto_1.FavoriteMusicResponseDTO.toResponse(music));
                return res.status(http_status_code_1.HTTPStatusCode.Ok).json({
                    success: true,
                    data: favoritesDTO
                });
            }
            catch (error) {
                return res.status(error.statusCode || http_status_code_1.HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: error.message || 'Failed to get favorite music'
                });
            }
        }));
        /**
         * @swagger
         * /v1/user/{userId}/favorites:
         *   post:
         *     summary: Add music to user's favorites
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the user
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - musicId
         *             properties:
         *               musicId:
         *                 type: string
         *                 description: ID of the music to add to favorites
         *     responses:
         *       200:
         *         description: Music added to favorites successfully
         *       400:
         *         description: Invalid request
         *       404:
         *         description: User or music not found
         *       409:
         *         description: Music already in favorites
         *       500:
         *         description: Internal server error
         */
        this.addFavorite = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const { musicId } = req.body;
            if (!musicId) {
                return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                    success: false,
                    message: 'Music ID is required'
                });
            }
            try {
                yield this.userService.addFavoriteMusic(userId, musicId);
                return res.status(http_status_code_1.HTTPStatusCode.Ok).json({
                    success: true,
                    message: 'Music added to favorites successfully'
                });
            }
            catch (error) {
                return res.status(error.statusCode || http_status_code_1.HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: error.message || 'Failed to add music to favorites'
                });
            }
        }));
        /**
         * @swagger
         * /v1/user/{userId}/favorites/{musicId}:
         *   delete:
         *     summary: Remove music from user's favorites
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the user
         *       - in: path
         *         name: musicId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the music to remove from favorites
         *     responses:
         *       200:
         *         description: Music removed from favorites successfully
         *       404:
         *         description: User not found
         *       500:
         *         description: Internal server error
         */
        this.removeFavorite = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const musicId = req.params.musicId;
            try {
                yield this.userService.removeFavoriteMusic(userId, musicId);
                return res.status(http_status_code_1.HTTPStatusCode.Ok).json({
                    success: true,
                    message: 'Music removed from favorites successfully'
                });
            }
            catch (error) {
                return res.status(error.statusCode || http_status_code_1.HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: error.message || 'Failed to remove music from favorites'
                });
            }
        }));
        /**
         * @swagger
         * /v1/user/{userId}/favorites/{musicId}/check:
         *   get:
         *     summary: Check if music is in user's favorites
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the user
         *       - in: path
         *         name: musicId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID of the music to check
         *     responses:
         *       200:
         *         description: Check result
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                   example: true
         *                 isFavorite:
         *                   type: boolean
         *       404:
         *         description: User not found
         *       500:
         *         description: Internal server error
         */
        this.checkFavorite = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const musicId = req.params.musicId;
            try {
                const isFavorite = yield this.userService.isMusicFavorite(userId, musicId);
                return res.status(http_status_code_1.HTTPStatusCode.Ok).json({
                    success: true,
                    isFavorite
                });
            }
            catch (error) {
                return res.status(error.statusCode || http_status_code_1.HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: error.message || 'Failed to check favorite status'
                });
            }
        }));
        // Debug endpoint to check user data
        this.debugUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = req.params.userId;
            try {
                const user = yield this.userService.getUserById(userId);
                // Also get the raw user data with favorites
                const rawUser = yield this.userService.getRawUserWithFavorites(userId);
                return res.status(http_status_code_1.HTTPStatusCode.Ok).json({
                    success: true,
                    userData: user,
                    rawFavorites: rawUser.favorites,
                    favoritesCount: ((_a = rawUser.favorites) === null || _a === void 0 ? void 0 : _a.length) || 0
                });
            }
            catch (error) {
                return res.status(error.statusCode || http_status_code_1.HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: error.message || 'Failed to get user debug info'
                });
            }
        }));
    }
};
UserController = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [user_service_1.default])
], UserController);
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map