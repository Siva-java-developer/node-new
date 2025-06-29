import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import UPLOAD_CONFIG from '../config/upload.config';
import { HTTPStatusCode } from '../config/enum/http-status.code';

/**
 * Middleware to handle file upload errors
 */
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        console.error('File upload error:', err);
        
        // Handle specific multer errors
        if (err instanceof multer.MulterError) {
            switch (err.code) {
                case 'LIMIT_FILE_SIZE':
                    // Determine the file type and return appropriate error message
                    if (req.route.path.includes('music')) {
                        return res.status(HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: UPLOAD_CONFIG.AUDIO.ERRORS.SIZE
                        });
                    } else if (req.route.path.includes('profile-image') || err.field === 'profileImage') {
                        return res.status(HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: UPLOAD_CONFIG.IMAGE.ERRORS.SIZE
                        });
                    } else if (req.route.path.includes('playlist') || err.field === 'thumbnail') {
                        return res.status(HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: UPLOAD_CONFIG.IMAGE.ERRORS.SIZE
                        });
                    } else {
                        return res.status(HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: `File too large. Maximum size allowed is ${formatBytes(err.field === 'audioFile' 
                                ? UPLOAD_CONFIG.AUDIO.SIZE.MAX 
                                : UPLOAD_CONFIG.IMAGE.SIZE.MAX)}`
                        });
                    }
                
                case 'LIMIT_FILE_COUNT':
                    return res.status(HTTPStatusCode.BadRequest).json({
                        success: false,
                        message: UPLOAD_CONFIG.GENERAL.ERRORS.TOO_MANY_FILES
                    });
                
                default:
                    return res.status(HTTPStatusCode.BadRequest).json({
                        success: false,
                        message: UPLOAD_CONFIG.GENERAL.ERRORS.GENERAL,
                        error: err.message
                    });
            }
        }
        
        // Handle custom errors (like file type errors)
        return res.status(HTTPStatusCode.BadRequest).json({
            success: false,
            message: err.message || UPLOAD_CONFIG.GENERAL.ERRORS.GENERAL
        });
    }
    
    next();
};

/**
 * Format bytes to human-readable format
 * @param bytes Number of bytes
 * @returns Formatted string (e.g., "5 MB")
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}