import { Request, Response, NextFunction, Router } from "express";
import BulkUserController from '../controller/bulk-user.controller';
import Container from 'typedi';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../model/user.model';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage for Excel uploads
const excelUploadDir = path.join(__dirname, '../uploads/Excel');

// Ensure directory exists
if (!fs.existsSync(excelUploadDir)) {
    fs.mkdirSync(excelUploadDir, { recursive: true });
}

const excelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, excelUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'user-upload-' + uniqueSuffix + ext);
    }
});

// File filter for Excel files
const excelFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel files are allowed'));
    }
};

// Create Excel upload middleware
const excelUpload = multer({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: 1 // Only one file at a time
    }
});

const router = Router();
const bulkUserController = Container.get(BulkUserController);

/**
 * @swagger
 * /v1/bulk-user/template:
 *   get:
 *     summary: Download Excel template for bulk user upload
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *       500:
 *         description: Internal server error
 */
router.get('/template', protect, authorize(UserRole.ADMIN, UserRole.TEACHER), (req: Request, res: Response, next: NextFunction) =>
    bulkUserController.downloadBulkUploadTemplate(req, res, next));

/**
 * @swagger
 * /v1/bulk-user/upload:
 *   post:
 *     summary: Bulk upload users from Excel file
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
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file with user data
 *     responses:
 *       200:
 *         description: Users uploaded successfully
 *       400:
 *         description: Invalid file or data
 *       500:
 *         description: Internal server error
 */
router.post('/upload', protect, authorize(UserRole.ADMIN, UserRole.TEACHER), excelUpload.single('file'), (req: Request, res: Response, next: NextFunction) =>
    bulkUserController.bulkUploadUsers(req, res, next));

export default router;