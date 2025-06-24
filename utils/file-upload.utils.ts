import multer from 'multer';
import path from 'path';
import fs from 'fs';
import UPLOAD_CONFIG from '../config/upload.config';
import config from '../config';

// Base uploads directory
const baseUploadDir = path.resolve(__dirname, '../uploads');
console.log('Base upload directory path:', baseUploadDir);

// Create subdirectories for different file types
const musicUploadDir = path.join(baseUploadDir, 'Music');
const profilesUploadDir = path.join(baseUploadDir, 'Profiles');

// Ensure all directories exist
const createDirIfNotExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

createDirIfNotExists(baseUploadDir);
createDirIfNotExists(musicUploadDir);
createDirIfNotExists(profilesUploadDir);

// Configure storage for music files
const musicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, musicUploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Configure storage for profile images
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilesUploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter for audio files
const audioFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only allowed audio file types
    if (UPLOAD_CONFIG.AUDIO.ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(UPLOAD_CONFIG.AUDIO.ERRORS.TYPE));
    }
};

// File filter for image files
const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only allowed image file types
    if (UPLOAD_CONFIG.IMAGE.ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(UPLOAD_CONFIG.IMAGE.ERRORS.TYPE));
    }
};

/**
 * Create a multer instance for audio uploads with custom file size limit
 * @param maxFileSize Maximum file size in bytes (default: from environment config)
 * @returns Configured multer instance
 */
export const createAudioUpload = (maxFileSize = config.fileUpload.maxSize) => {
    console.log(`Creating audio upload middleware with max file size: ${maxFileSize / (1024 * 1024)}MB`);
    
    return multer({
        storage: musicStorage,
        fileFilter: audioFileFilter,
        limits: {
            fileSize: Math.min(
                Math.max(maxFileSize, UPLOAD_CONFIG.AUDIO.SIZE.MIN), 
                UPLOAD_CONFIG.AUDIO.SIZE.MAX
            ), // Ensure size is within allowed range
            files: config.fileUpload.maxFiles,
            fieldNameSize: UPLOAD_CONFIG.GENERAL.MAX_FIELD_NAME_SIZE,
            fieldSize: UPLOAD_CONFIG.GENERAL.MAX_FIELD_VALUE_SIZE
        }
    });
};

/**
 * Create a multer instance for image uploads with custom file size limit
 * @param maxFileSize Maximum file size in bytes (default: from environment config)
 * @returns Configured multer instance
 */
export const createImageUpload = (maxFileSize = config.fileUpload.maxSize) => {
    console.log(`Creating image upload middleware with max file size: ${maxFileSize / (1024 * 1024)}MB`);
    
    return multer({
        storage: profileStorage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: Math.min(
                Math.max(maxFileSize, UPLOAD_CONFIG.IMAGE.SIZE.MIN), 
                UPLOAD_CONFIG.IMAGE.SIZE.MAX
            ), // Ensure size is within allowed range
            files: config.fileUpload.maxFiles,
            fieldNameSize: UPLOAD_CONFIG.GENERAL.MAX_FIELD_NAME_SIZE,
            fieldSize: UPLOAD_CONFIG.GENERAL.MAX_FIELD_VALUE_SIZE
        }
    });
};

// Create instances with environment-specific file size limits
export const audioUpload = createAudioUpload();
export const imageUpload = createImageUpload();