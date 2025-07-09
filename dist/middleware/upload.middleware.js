"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadErrors = void 0;
const multer_1 = __importDefault(require("multer"));
const upload_config_1 = __importDefault(require("../config/upload.config"));
const http_status_code_1 = require("../config/enum/http-status.code");
/**
 * Middleware to handle file upload errors
 */
const handleUploadErrors = (err, req, res, next) => {
    if (err) {
        console.error('File upload error:', err);
        // Handle specific multer errors
        if (err instanceof multer_1.default.MulterError) {
            switch (err.code) {
                case 'LIMIT_FILE_SIZE':
                    // Determine the file type and return appropriate error message
                    if (req.route.path.includes('music')) {
                        return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: upload_config_1.default.AUDIO.ERRORS.SIZE
                        });
                    }
                    else if (req.route.path.includes('profile-image') || err.field === 'profileImage') {
                        return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: upload_config_1.default.IMAGE.ERRORS.SIZE
                        });
                    }
                    else {
                        return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                            success: false,
                            message: `File too large. Maximum size allowed is ${formatBytes(err.field === 'audioFile'
                                ? upload_config_1.default.AUDIO.SIZE.MAX
                                : upload_config_1.default.IMAGE.SIZE.MAX)}`
                        });
                    }
                case 'LIMIT_FILE_COUNT':
                    return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                        success: false,
                        message: upload_config_1.default.GENERAL.ERRORS.TOO_MANY_FILES
                    });
                default:
                    return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
                        success: false,
                        message: upload_config_1.default.GENERAL.ERRORS.GENERAL,
                        error: err.message
                    });
            }
        }
        // Handle custom errors (like file type errors)
        return res.status(http_status_code_1.HTTPStatusCode.BadRequest).json({
            success: false,
            message: err.message || upload_config_1.default.GENERAL.ERRORS.GENERAL
        });
    }
    next();
};
exports.handleUploadErrors = handleUploadErrors;
/**
 * Format bytes to human-readable format
 * @param bytes Number of bytes
 * @returns Formatted string (e.g., "5 MB")
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
//# sourceMappingURL=upload.middleware.js.map