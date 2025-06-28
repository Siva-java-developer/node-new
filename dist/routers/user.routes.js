"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const typedi_1 = __importDefault(require("typedi"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_model_1 = require("../model/user.model");
const file_upload_utils_1 = require("../utils/file-upload.utils");
const upload_middleware_1 = require("../middleware/upload.middleware");
const custom_error_1 = __importDefault(require("../config/custom.error"));
const http_status_code_1 = require("../config/enum/http-status.code");
const router = (0, express_1.Router)();
const userController = typedi_1.default.get(user_controller_1.default);
/**
 * @swagger
 * /v1/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - password
 *               - age
 *               - gender
 *               - mobileNumber
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               mobileNumber:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin]
 *               class:
 *                 type: string
 *               syllabus:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User profile image (JPEG, PNG, GIF, WEBP)
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User saved
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN, user_model_1.UserRole.TEACHER), file_upload_utils_1.imageUpload.single('profileImage'), upload_middleware_1.handleUploadErrors, (req, res, next) => userController.addUser(req, res, next));
/**
 * @swagger
 * /v1/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth_middleware_1.protect, (req, res, next) => userController.getUser(req, res, next));
/**
 * @swagger
 * /v1/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', auth_middleware_1.protect, (req, res, next) => userController.getUserById(req, res, next));
/**
 * @swagger
 * /v1/user/{id}:
 *   put:
 *     summary: Update user
 *     description: Users can update their own profile. Admin and teacher roles can update any user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               mobileNumber:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin]
 *               class:
 *                 type: string
 *               syllabus:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User profile image (JPEG, PNG, GIF, WEBP)
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User updated
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Students can only update their own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Middleware to check if user is updating their own profile or has admin/teacher privileges
const checkUserUpdatePermission = (req, res, next) => {
    const user = req.user;
    const requestedUserId = req.params.id;
    // Allow if user is updating their own profile or is an admin/teacher
    if (user._id.toString() === requestedUserId ||
        [user_model_1.UserRole.ADMIN, user_model_1.UserRole.TEACHER].includes(user.role)) {
        next();
    }
    else {
        throw new custom_error_1.default(`User role ${user.role} is not authorized to update other users`, http_status_code_1.HTTPStatusCode.Forbidden);
    }
};
router.put('/:id', auth_middleware_1.protect, checkUserUpdatePermission, file_upload_utils_1.imageUpload.single('profileImage'), upload_middleware_1.handleUploadErrors, (req, res, next) => userController.updateUser(req, res, next));
/**
 * @swagger
 * /v1/user/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN), (req, res, next) => userController.deleteUser(req, res, next));
// Profile image download route
/**
 * @swagger
 * /v1/user/{userId}/profile-image:
 *   get:
 *     summary: Download profile image by user ID
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
 *       404:
 *         description: User or image not found
 */
router.get('/:userId/profile-image', auth_middleware_1.protect, (req, res, next) => userController.downloadProfileImageByUserId(req, res, next));
// Favorite music routes
router.get('/:userId/favorites', auth_middleware_1.protect, (req, res, next) => userController.getUserFavorites(req, res, next));
router.post('/:userId/favorites', auth_middleware_1.protect, (req, res, next) => userController.addFavorite(req, res, next));
router.delete('/:userId/favorites/:musicId', auth_middleware_1.protect, (req, res, next) => userController.removeFavorite(req, res, next));
router.get('/:userId/favorites/:musicId/check', auth_middleware_1.protect, (req, res, next) => userController.checkFavorite(req, res, next));
// Debug route
router.get('/:userId/debug', auth_middleware_1.protect, (req, res, next) => userController.debugUser(req, res, next));
exports.default = router;
//# sourceMappingURL=user.routes.js.map