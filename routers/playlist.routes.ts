import { Router } from "express";
import { PlaylistController } from "../controller/playlist.controller";
import { protect } from "../middleware/auth.middleware";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { handleUploadErrors } from "../middleware/upload.middleware";


// Configure storage for playlist thumbnails
const playlistThumbnailStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        const uploadPath = path.resolve(__dirname, '../uploads/Playlists/thumbnails');
        
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req: any, file: any, cb: any) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'playlist-thumbnail-' + uniqueSuffix + ext);
    }
});

// File filter for image files
const imageFileFilter = (req: any, file: any, cb: any) => {
    // Accept only common image file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
    }
};

// Create the upload middleware directly in this file
let playlistThumbnailUpload: any;
try {
    // Ensure the upload directory exists
    const uploadDir = path.resolve(__dirname, '../uploads/Playlists/thumbnails');
    console.log('__dirname:', __dirname);
    console.log('uploadDir:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created upload directory:', uploadDir);
    }
    
    // Create a simple multer configuration first
    playlistThumbnailUpload = multer({
        dest: uploadDir,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB default
            files: 1
        }
    });
    console.log('Multer upload middleware created successfully');
} catch (error) {
    console.error('Error creating multer upload middleware:', error);
    // Fallback to basic multer
    playlistThumbnailUpload = multer({ dest: 'uploads/' });
}

const router = Router();
const playlistController = new PlaylistController();

// Public routes (no authentication required)
router.get('/', playlistController.getPublicPlaylists); // Main playlist listing
router.get('/search', playlistController.searchPlaylists);
router.get('/uid/:uid', playlistController.getPlaylistByUid);
router.get('/thumbnail/:fileName', playlistController.downloadThumbnail);
router.get('/thumbnails', playlistController.getThumbnails);

// Protected routes (authentication required)
router.use(protect);

// Playlist CRUD operations that require authentication
router.post('/', 
    playlistThumbnailUpload ? playlistThumbnailUpload.single('thumbnail') : (req: any, res: any, next: any) => next(), 
    handleUploadErrors, 
    playlistController.createPlaylist
);
router.get('/my', playlistController.getUserPlaylists);
router.get('/accessible', playlistController.getAccessiblePlaylists);
router.get('/shared', playlistController.getSharedPlaylists);

// Generic routes that should come after specific ones
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', 
    playlistThumbnailUpload ? playlistThumbnailUpload.single('thumbnail') : (req: any, res: any, next: any) => next(), 
    handleUploadErrors, 
    playlistController.updatePlaylist
);
router.delete('/:id', playlistController.deletePlaylist);

// Song management in playlists
router.post('/:id/songs', playlistController.addSongToPlaylist);
router.delete('/:id/songs', playlistController.removeSongFromPlaylist);
router.put('/:id/reorder', playlistController.reorderSongs);

// Playlist sharing
router.post('/:id/share', playlistController.sharePlaylist);
router.post('/:id/unshare', playlistController.unsharePlaylist);

// Playlist interaction
router.post('/:id/play', playlistController.playPlaylist);

export default router;