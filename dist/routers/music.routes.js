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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
const express_1 = __importDefault(require("express"));
const music_controller_1 = require("../controller/music.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_model_1 = require("../model/user.model");
const file_upload_utils_1 = require("../utils/file-upload.utils");
const upload_middleware_1 = require("../middleware/upload.middleware");
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const mm = __importStar(require("music-metadata"));
/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 */
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0)
        return '00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}
const router = express_1.default.Router();
const musicController = new music_controller_1.MusicController();
/**
 * @swagger
 * tags:
 *   name: Music
 *   description: Music module management API
 */
// Public routes
router.get('/', musicController.getAllMusic);
// Get music by filename - must come before the :id route
router.get('/file/:filename', musicController.getMusicByFilename);
// Download music file - must come before the :id route
router.get('/download/:filename', musicController.downloadMusicFile);
// Download thumbnail - must come before the :id route
router.get('/thumbnail/:fileName', musicController.downloadThumbnail);
// Delete music file - must come before the :id route (protected route)
router.delete('/file/delete/:filename', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(user_model_1.UserRole.TEACHER, user_model_1.UserRole.ADMIN), musicController.deleteMusicFile);
// Delete thumbnail - must come before the :id route (protected route)
router.delete('/thumbnail/:fileName', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(user_model_1.UserRole.TEACHER, user_model_1.UserRole.ADMIN), musicController.deleteThumbnail);
// Simple test route for upload path - must come before the :id route
router.get('/test/upload', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Upload route is accessible',
        uploadPath: path_1.default.resolve(__dirname, '../uploads')
    });
});
// Public test upload route - no auth required
router.post('/test/upload', file_upload_utils_1.audioUpload.single('audioFile'), upload_middleware_1.handleUploadErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Test upload endpoint hit');
    console.log('Request file:', req.file);
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }
    const fileName = req.file.filename;
    const filePath = `/uploads/Music/${fileName}`;
    const absoluteFilePath = path_1.default.join(__dirname, '..', 'uploads', 'Music', fileName);
    try {
        // Extract metadata from the audio file
        const metadata = yield mm.parseFile(absoluteFilePath);
        // Calculate duration in different formats
        const durationSeconds = metadata.format.duration || 0;
        const durationFormatted = formatDuration(durationSeconds);
        return res.status(200).json({
            success: true,
            fileName: fileName,
            filePath: filePath,
            environment: process.env.NODE_ENV || 'development',
            maxFileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB / ${(config_1.default.fileUpload.maxSize / (1024 * 1024)).toFixed(2)} MB`,
            duration: {
                seconds: durationSeconds,
                formatted: durationFormatted
            },
            format: metadata.format.container || metadata.format.codec,
            bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) + ' kbps' : 'Unknown',
            message: 'Test file upload successful'
        });
    }
    catch (error) {
        console.error('Error extracting audio metadata:', error);
        // Still return success but without duration info
        return res.status(200).json({
            success: true,
            fileName: fileName,
            filePath: filePath,
            environment: process.env.NODE_ENV || 'development',
            maxFileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB / ${(config_1.default.fileUpload.maxSize / (1024 * 1024)).toFixed(2)} MB`,
            duration: {
                seconds: 0,
                formatted: '00:00'
            },
            message: 'Test file upload successful (could not extract duration)'
        });
    }
}));
// ID route should come after specific routes
router.get('/:id', musicController.getMusicById);
// Protected routes - require authentication
router.use(auth_middleware_1.protect);
// Routes for teachers and admins only
router.use((0, auth_middleware_1.authorize)(user_model_1.UserRole.TEACHER, user_model_1.UserRole.ADMIN));
// File upload route - uses environment-specific configuration
router.post('/upload', file_upload_utils_1.audioUpload.single('audioFile'), upload_middleware_1.handleUploadErrors, musicController.uploadMusicFile);
// Thumbnail upload route
router.post('/upload/thumbnail', file_upload_utils_1.musicThumbnailUpload.single('imageFile'), upload_middleware_1.handleUploadErrors, musicController.uploadThumbnail);
// Filter route
router.post('/filter', musicController.filterMusic);
// General routes
router.post('/', musicController.createMusic);
router.put('/:id', musicController.updateMusic);
router.delete('/:id', musicController.deleteMusic);
exports.default = router;
//# sourceMappingURL=music.routes.js.map