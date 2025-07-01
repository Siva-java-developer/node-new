import { Router } from "express";
import { PlaylistController } from "../controller/playlist.controller";
import { protect } from "../middleware/auth.middleware";
import { playlistThumbnailUpload } from "../utils/file-upload.utils";
import { handleUploadErrors } from "../middleware/upload.middleware";

const router = Router();
const playlistController = new PlaylistController();

// Public routes (no authentication required)
router.get('/', playlistController.getPublicPlaylists); // Main playlist listing
router.get('/search', playlistController.searchPlaylists);
router.get('/uid/:uid', playlistController.getPlaylistByUid);

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