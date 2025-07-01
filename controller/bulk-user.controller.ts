import { Request, Response } from 'express';
import { Service } from 'typedi';
import asyncHandler from 'express-async-handler';
import { HTTPStatusCode } from '../config/enum/http-status.code';
import fs from 'fs';
import path from 'path';
import UserService from '../service/user.service';
import { UserCreationDTO } from '../dto/user.dto';
import { generateUserUploadTemplate, parseUserUploadExcel } from '../utils/excel.utils';

@Service()
class BulkUserController {
    constructor(private readonly userService: UserService) {}

    /**
     * @swagger
     * /v1/user/bulk-upload/template:
     *   get:
     *     summary: Download Excel template for bulk user upload
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Excel template file
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *       500:
     *         description: Internal server error
     */
    downloadBulkUploadTemplate = asyncHandler(async (req: Request, res: Response) => {
        try {
            // Generate the template file (now async)
            const templatePath = await generateUserUploadTemplate();
            
            // Get filename from path
            const filename = path.basename(templatePath);
            
            // Set headers for file download
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            // Stream the file to the response
            const fileStream = fs.createReadStream(templatePath);
            fileStream.pipe(res);
            
            // Delete the file after sending (cleanup)
            fileStream.on('end', () => {
                fs.unlink(templatePath, (err) => {
                    if (err) console.error('Error deleting template file:', err);
                });
            });
        } catch (error: any) {
            console.error('Error generating template:', error);
            return res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: 'Failed to generate Excel template'
            });
        }
    });

    /**
     * @swagger
     * /v1/user/bulk-upload:
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
    bulkUploadUsers = asyncHandler(async (req: Request, res: Response) => {
        try {
            // Check if file was uploaded
            if (!req.file) {
                return res.status(HTTPStatusCode.BadRequest).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }
            
            // Parse the Excel file
            const filePath = req.file.path;
            const userData = parseUserUploadExcel(filePath);
            
            // Validate that we have data
            if (!userData || userData.length === 0) {
                return res.status(HTTPStatusCode.BadRequest).json({
                    success: false,
                    message: 'No user data found in the uploaded file'
                });
            }
            
            // Process the bulk upload
            const result = await this.userService.bulkCreateUsers(userData as UserCreationDTO[]);
            
            // Delete the temporary file
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
            
            return res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: 'Bulk user upload processed',
                data: result
            });
        } catch (error: any) {
            console.error('Error processing bulk upload:', error);
            return res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: 'Failed to process bulk user upload'
            });
        }
    });
}

export default BulkUserController;