import express from 'express';
import { MusicController } from '../controller/music.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../model/user.model';
import { audioUpload, imageUpload, musicThumbnailUpload, lyricsUpload } from '../utils/file-upload.utils';
import { handleUploadErrors } from '../middleware/upload.middleware';
import path from 'path';
import UPLOAD_CONFIG from '../config/upload.config';
import config from '../config';
import * as mm from 'music-metadata';

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 */
function formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

const router = express.Router();
const musicController = new MusicController();

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

// Download lyrics - must come before the :id route
router.get('/lyrics/:fileName', musicController.downloadLyrics);

// Get list of thumbnail filenames (all or filtered by filename array) - must come before the :id route
router.get('/thumbnails/list', musicController.getThumbnailList);

// Filter route - public access for searching music
router.get('/filter', musicController.filterMusic);

// Delete music file - must come before the :id route (protected route)
router.delete('/file/delete/:filename', protect, authorize(UserRole.TEACHER, UserRole.ADMIN), musicController.deleteMusicFile);

// Delete thumbnail - must come before the :id route (protected route)
router.delete('/thumbnail/:fileName', protect, authorize(UserRole.TEACHER, UserRole.ADMIN), musicController.deleteThumbnail);

// Delete lyrics - must come before the :id route (protected route)
router.delete('/lyrics/:fileName', protect, authorize(UserRole.TEACHER, UserRole.ADMIN), musicController.deleteLyrics);

// Simple test route for upload path - must come before the :id route
router.get('/test/upload', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Upload route is accessible',
        uploadPath: path.resolve(__dirname, '../uploads')
    });
});

// Public test upload route - no auth required
router.post('/test/upload', audioUpload.single('audioFile'), handleUploadErrors, async (req, res) => {
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
    const absoluteFilePath = path.join(__dirname, '..', 'uploads', 'Music', fileName);
    
    try {
        // Extract metadata from the audio file
        const metadata = await mm.parseFile(absoluteFilePath);
        
        // Calculate duration in different formats
        const durationSeconds = metadata.format.duration || 0;
        const durationFormatted = formatDuration(durationSeconds);
        
        return res.status(200).json({
            success: true,
            fileName: fileName,
            filePath: filePath,
            environment: process.env.NODE_ENV || 'development',
            maxFileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB / ${(config.fileUpload.maxSize / (1024 * 1024)).toFixed(2)} MB`,
            duration: {
                seconds: durationSeconds,
                formatted: durationFormatted
            },
            format: metadata.format.container || metadata.format.codec,
            bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) + ' kbps' : 'Unknown',
            message: 'Test file upload successful'
        });
    } catch (error) {
        console.error('Error extracting audio metadata:', error);
        
        // Still return success but without duration info
        return res.status(200).json({
            success: true,
            fileName: fileName,
            filePath: filePath,
            environment: process.env.NODE_ENV || 'development',
            maxFileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB / ${(config.fileUpload.maxSize / (1024 * 1024)).toFixed(2)} MB`,
            duration: {
                seconds: 0,
                formatted: '00:00'
            },
            message: 'Test file upload successful (could not extract duration)'
        });
    }
});

// ID route should come after specific routes
router.get('/:id', musicController.getMusicById);

// Protected routes - require authentication
router.use(protect);

// Routes for teachers and admins only
router.use(authorize(UserRole.TEACHER, UserRole.ADMIN));

// File upload route - uses environment-specific configuration
router.post('/upload', audioUpload.single('audioFile'), handleUploadErrors, musicController.uploadMusicFile);

// Thumbnail upload route
router.post('/upload/thumbnail', musicThumbnailUpload.single('imageFile'), handleUploadErrors, musicController.uploadThumbnail);

// Lyrics upload route
router.post('/upload/lyrics', lyricsUpload.single('lyricsFile'), handleUploadErrors, musicController.uploadLyrics);

// General routes
router.post('/', musicController.createMusic);
router.put('/:id', musicController.updateMusic);
router.delete('/:id', musicController.deleteMusic);

export default router;