import { Router } from "express";
import { PlaylistController } from "../controller/playlist.controller";
import { protect } from "../middleware/auth.middleware";
import multer from 'multer';
import path from 'path';
import { handleUploadErrors } from "../middleware/upload.middleware";


// Configure storage for playlist thumbnails
const playlistThumbnailStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, path.resolve(__dirname, '../uploads/Playlists/thumbnails'));
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
const playlistThumbnailUpload = multer({
    storage: playlistThumbnailStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB default
        files: 1
    }
});

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
router.post('/', playlistThumbnailUpload.single('thumbnail'), handleUploadErrors, playlistController.createPlaylist);
router.get('/my', playlistController.getUserPlaylists);
router.get('/accessible', playlistController.getAccessiblePlaylists);
router.get('/shared', playlistController.getSharedPlaylists);

// Generic routes that should come after specific ones
router.get('/:id', playlistController.getPlaylistById);
router.put('/:id', playlistThumbnailUpload.single('thumbnail'), handleUploadErrors, playlistController.updatePlaylist);
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