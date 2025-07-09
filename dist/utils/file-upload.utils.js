"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lyricsUpload = exports.musicThumbnailUpload = exports.imageUpload = exports.audioUpload = exports.createLyricsUpload = exports.createMusicThumbnailUpload = exports.createImageUpload = exports.createAudioUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const upload_config_1 = __importDefault(require("../config/upload.config"));
const config_1 = __importDefault(require("../config"));
// Base uploads directory
const baseUploadDir = path_1.default.resolve(__dirname, '../uploads');
console.log('Base upload directory path:', baseUploadDir);
// Create subdirectories for different file types
const musicUploadDir = path_1.default.join(baseUploadDir, 'Music');
const profilesUploadDir = path_1.default.join(baseUploadDir, 'Profiles');
const thumbnailsUploadDir = path_1.default.join(musicUploadDir, 'thumbnails');
const lyricsUploadDir = path_1.default.join(musicUploadDir, 'lyrics');
// Ensure all directories exist
const createDirIfNotExists = (dirPath) => {
    if (!fs_1.default.existsSync(dirPath)) {
        console.log(`Creating directory: ${dirPath}`);
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
};
createDirIfNotExists(baseUploadDir);
createDirIfNotExists(musicUploadDir);
createDirIfNotExists(profilesUploadDir);
createDirIfNotExists(thumbnailsUploadDir);
createDirIfNotExists(lyricsUploadDir);
// Configure storage for music files
const musicStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, musicUploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
// Configure storage for profile images
const profileStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilesUploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
// Configure storage for music thumbnails
const musicThumbnailStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, thumbnailsUploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, 'thumbnail-' + uniqueSuffix + ext);
    }
});
// Configure storage for lyrics files (LRC)
const lyricsStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, lyricsUploadDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname) || '.lrc'; // Default to .lrc if no extension
        cb(null, 'lyrics-' + uniqueSuffix + ext);
    }
});
// File filter for audio files
const audioFileFilter = (req, file, cb) => {
    // Accept only allowed audio file types
    if (upload_config_1.default.AUDIO.ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(upload_config_1.default.AUDIO.ERRORS.TYPE));
    }
};
// File filter for image files
const imageFileFilter = (req, file, cb) => {
    // Accept only allowed image file types
    if (upload_config_1.default.IMAGE.ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(upload_config_1.default.IMAGE.ERRORS.TYPE));
    }
};
// File filter for lyrics files (LRC)
const lyricsFileFilter = (req, file, cb) => {
    // Check file extension first (for .lrc files)
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ext === '.lrc' || ext === '.txt') {
        cb(null, true);
    }
    // Then check MIME type as fallback
    else if (upload_config_1.default.LYRICS.ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(upload_config_1.default.LYRICS.ERRORS.TYPE));
    }
};
/**
 * Create a multer instance for audio uploads with custom file size limit
 * @param maxFileSize Maximum file size in bytes (default: from environment config)
 * @returns Configured multer instance
 */
const createAudioUpload = (maxFileSize = config_1.default.fileUpload.maxSize) => {
    console.log(`Creating audio upload middleware with max file size: ${maxFileSize / (1024 * 1024)}MB`);
    return (0, multer_1.default)({
        storage: musicStorage,
        fileFilter: audioFileFilter,
        limits: {
            fileSize: Math.min(Math.max(maxFileSize, upload_config_1.default.AUDIO.SIZE.MIN), upload_config_1.default.AUDIO.SIZE.MAX), // Ensure size is within allowed range
            files: config_1.default.fileUpload.maxFiles,
            fieldNameSize: upload_config_1.default.GENERAL.MAX_FIELD_NAME_SIZE,
            fieldSize: upload_config_1.default.GENERAL.MAX_FIELD_VALUE_SIZE
        }
    });
};
exports.createAudioUpload = createAudioUpload;
/**
 * Create a multer instance for profile image uploads with custom file size limit
 * @param maxFileSize Maximum file size in bytes (default: from environment config)
 * @returns Configured multer instance
 */
const createImageUpload = (maxFileSize = config_1.default.fileUpload.maxSize) => {
    console.log(`Creating profile image upload middleware with max file size: ${maxFileSize / (1024 * 1024)}MB`);
    return (0, multer_1.default)({
        storage: profileStorage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: Math.min(Math.max(maxFileSize, upload_config_1.default.IMAGE.SIZE.MIN), upload_config_1.default.IMAGE.SIZE.MAX), // Ensure size is within allowed range
            files: config_1.default.fileUpload.maxFiles,
            fieldNameSize: upload_config_1.default.GENERAL.MAX_FIELD_NAME_SIZE,
            fieldSize: upload_config_1.default.GENERAL.MAX_FIELD_VALUE_SIZE
        }
    });
};
exports.createImageUpload = createImageUpload;
/**
 * Create a multer instance for music thumbnail uploads with custom file size limit
 * @param maxFileSize Maximum file size in bytes (default: from environment config)
 * @returns Configured multer instance
 */
const createMusicThumbnailUpload = (maxFileSize = config_1.default.fileUpload.maxSize) => {
    console.log(`Creating music thumbnail upload middleware with max file size: ${maxFileSize / (1024 * 1024)}MB`);
    return (0, multer_1.default)({
        storage: musicThumbnailStorage,
        fileFilter: imageFileFilter,
        limits: {
            fileSize: Math.min(Math.max(maxFileSize, upload_config_1.default.IMAGE.SIZE.MIN), upload_config_1.default.IMAGE.SIZE.MAX), // Ensure size is within allowed range
            files: config_1.default.fileUpload.maxFiles,
            fieldNameSize: upload_config_1.default.GENERAL.MAX_FIELD_NAME_SIZE,
            fieldSize: upload_config_1.default.GENERAL.MAX_FIELD_VALUE_SIZE
        }
    });
};
exports.createMusicThumbnailUpload = createMusicThumbnailUpload;
/**
 * Create a multer instance for lyrics (LRC) file uploads with custom file size limit
 * @param maxFileSize Maximum file size in bytes (default: 5MB)
 * @returns Configured multer instance
 */
const createLyricsUpload = (maxFileSize = upload_config_1.default.LYRICS.SIZE.DEFAULT) => {
    console.log(`Creating lyrics upload middleware with max file size: ${maxFileSize / (1024 * 1024)}MB`);
    return (0, multer_1.default)({
        storage: lyricsStorage,
        fileFilter: lyricsFileFilter,
        limits: {
            fileSize: Math.min(Math.max(maxFileSize, upload_config_1.default.LYRICS.SIZE.MIN), upload_config_1.default.LYRICS.SIZE.MAX), // Ensure size is within allowed range
            files: 1, // Only one lyrics file at a time
            fieldNameSize: upload_config_1.default.GENERAL.MAX_FIELD_NAME_SIZE,
            fieldSize: upload_config_1.default.GENERAL.MAX_FIELD_VALUE_SIZE
        }
    });
};
exports.createLyricsUpload = createLyricsUpload;
// Create instances with environment-specific file size limits
exports.audioUpload = (0, exports.createAudioUpload)();
exports.imageUpload = (0, exports.createImageUpload)();
exports.musicThumbnailUpload = (0, exports.createMusicThumbnailUpload)();
exports.lyricsUpload = (0, exports.createLyricsUpload)();
//# sourceMappingURL=file-upload.utils.js.map