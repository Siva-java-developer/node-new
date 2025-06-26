import { Request, Response, NextFunction, Router } from "express";
import UserController from '../controller/user.controller'
import Container from 'typedi';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../model/user.model';
import { imageUpload } from '../utils/file-upload.utils';
import { handleUploadErrors } from '../middleware/upload.middleware';
import UPLOAD_CONFIG from '../config/upload.config';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';

const router = Router()
const userController = Container.get(UserController);

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
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.TEACHER), imageUpload.single('profileImage'), handleUploadErrors, (req: Request, res: Response, next: NextFunction) =>
    userController.addUser(req, res, next));

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
router.get('/', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.getUser(req, res, next));

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
router.get('/:id', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.getUserById(req, res, next));

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
const checkUserUpdatePermission = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const requestedUserId = req.params.id;
    
    // Allow if user is updating their own profile or is an admin/teacher
    if (user._id.toString() === requestedUserId || 
        [UserRole.ADMIN, UserRole.TEACHER].includes(user.role)) {
        next();
    } else {
        throw new CustomError(
            `User role ${user.role} is not authorized to update other users`,
            HTTPStatusCode.Forbidden
        );
    }
};

router.put('/:id', protect, checkUserUpdatePermission, imageUpload.single('profileImage'), handleUploadErrors, (req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(req, res, next));

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
router.delete('/:id', protect, authorize(UserRole.ADMIN), (req: Request, res: Response, next: NextFunction) =>
    userController.deleteUser(req, res, next));

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
router.get('/:userId/profile-image', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.downloadProfileImageByUserId(req, res, next));

// Favorite music routes
router.get('/:userId/favorites', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.getUserFavorites(req, res, next));

router.post('/:userId/favorites', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.addFavorite(req, res, next));

router.delete('/:userId/favorites/:musicId', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.removeFavorite(req, res, next));

router.get('/:userId/favorites/:musicId/check', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.checkFavorite(req, res, next));

// Debug route
router.get('/:userId/debug', protect, (req: Request, res: Response, next: NextFunction) =>
    userController.debugUser(req, res, next));

export default router