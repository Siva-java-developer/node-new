import { Request, Response } from "express";
import { PlaylistService } from "../service/playlist.service";
import { 
    CreatePlaylistDto,
    CreatePlaylistWithFileDto,
    UpdatePlaylistDto,
    UpdatePlaylistWithFileDto,
    AddSongToPlaylistDto, 
    RemoveSongFromPlaylistDto,
    SharePlaylistDto,
    ReorderSongsDto,
    PlaylistSearchDto
} from "../dto/playlist.dto";
import { HTTPStatusCode } from "../config/enum/http-status.code";
import CustomError from "../config/custom.error";

export class PlaylistController {
    private playlistService: PlaylistService;

    constructor() {
        this.playlistService = new PlaylistService();
    }

    /**
     * @swagger
     * /v1/playlists:
     *   post:
     *     summary: Create a new playlist with optional thumbnail
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 description: Name of the playlist
     *               description:
     *                 type: string
     *                 description: Description of the playlist
     *               visibility:
     *                 type: string
     *                 enum: [private, public, shared]
     *                 description: Visibility setting of the playlist
     *               thumbnail:
     *                 type: string
     *                 format: binary
     *                 description: Playlist thumbnail image file (JPEG, PNG, GIF, WEBP - max 20MB)
     *     responses:
     *       201:
     *         description: Playlist created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    createPlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistData: CreatePlaylistWithFileDto = req.body;
            const thumbnailFile = req.file;

            // Build the complete data object
            const completeData: CreatePlaylistDto = {
                ...playlistData,
                thumbnail: thumbnailFile ? thumbnailFile.path : undefined
            };

            const result = await this.playlistService.createPlaylist(completeData, userId);

            res.status(HTTPStatusCode.Created).json({
                success: true,
                message: "Playlist created successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}:
     *   get:
     *     summary: Get playlist by ID
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Playlist retrieved successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    getPlaylistById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;

            const result = await this.playlistService.getPlaylistById(playlistId, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist retrieved successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/uid/{uid}:
     *   get:
     *     summary: Get playlist by UID
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: uid
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Playlist retrieved successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    getPlaylistByUid = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const uid = req.params.uid;

            const result = await this.playlistService.getPlaylistByUid(uid, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist retrieved successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/my:
     *   get:
     *     summary: Get user's own playlists
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: User playlists retrieved successfully
     */
    getUserPlaylists = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.playlistService.getUserPlaylists(userId, page, limit);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "User playlists retrieved successfully",
                data: result
            });
        } catch (error: any) {
            console.error('Error in getUserPlaylists:', error);
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/accessible:
     *   get:
     *     summary: Get all accessible playlists for user
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: Accessible playlists retrieved successfully
     */
    getAccessiblePlaylists = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.playlistService.getAccessiblePlaylists(userId, page, limit);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Accessible playlists retrieved successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists:
     *   get:
     *     summary: Get all playlists (main listing)
     *     tags: [Playlist]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: Playlists retrieved successfully
     */
    getPublicPlaylists = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.playlistService.getPublicPlaylists(page, limit);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Public playlists retrieved successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/shared:
     *   get:
     *     summary: Get playlists shared with user
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: Shared playlists retrieved successfully
     */
    getSharedPlaylists = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.playlistService.getSharedPlaylists(userId, page, limit);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Shared playlists retrieved successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}:
     *   put:
     *     summary: Update playlist with optional thumbnail
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Name of the playlist
     *               description:
     *                 type: string
     *                 description: Description of the playlist
     *               visibility:
     *                 type: string
     *                 enum: [private, public, shared]
     *                 description: Visibility setting of the playlist
     *               thumbnail:
     *                 type: string
     *                 format: binary
     *                 description: New playlist thumbnail image file (JPEG, PNG, GIF, WEBP - max 20MB)
     *     responses:
     *       200:
     *         description: Playlist updated successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    updatePlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;
            const updateData: UpdatePlaylistWithFileDto = req.body;
            const thumbnailFile = req.file;

            // Build the complete update data object
            const completeUpdateData: UpdatePlaylistDto = {
                ...updateData,
                thumbnail: thumbnailFile ? thumbnailFile.path : undefined
            };

            const result = await this.playlistService.updatePlaylist(playlistId, completeUpdateData, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist updated successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}:
     *   delete:
     *     summary: Delete playlist
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Playlist deleted successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    deletePlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;

            await this.playlistService.deletePlaylist(playlistId, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist deleted successfully"
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}/songs:
     *   post:
     *     summary: Add song to playlist
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - songId
     *             properties:
     *               songId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Song added to playlist successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    addSongToPlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('=== Controller Debug ===');
            console.log('Full user object:', (req as any).user);
            console.log('User _id:', (req as any).user._id);
            console.log('User _id type:', typeof (req as any).user._id);
            
            const userId = (req as any).user._id.toString();
            console.log('Extracted userId:', userId, '(type:', typeof userId, ')');
            console.log('========================');
            
            const playlistId = req.params.id;
            const songData: AddSongToPlaylistDto = req.body;

            const result = await this.playlistService.addSongToPlaylist(playlistId, songData, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Song added to playlist successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}/songs:
     *   delete:
     *     summary: Remove song from playlist
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - songId
     *             properties:
     *               songId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Song removed from playlist successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    removeSongFromPlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;
            const songData: RemoveSongFromPlaylistDto = req.body;

            const result = await this.playlistService.removeSongFromPlaylist(playlistId, songData, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Song removed from playlist successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}/reorder:
     *   put:
     *     summary: Reorder songs in playlist
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - songIds
     *             properties:
     *               songIds:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         description: Songs reordered successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    reorderSongs = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;
            const reorderData: ReorderSongsDto = req.body;

            const result = await this.playlistService.reorderSongs(playlistId, reorderData, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Songs reordered successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}/share:
     *   post:
     *     summary: Share playlist with users
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userIds
     *             properties:
     *               userIds:
     *                 type: array
     *                 items:
     *                   type: string
     *               canEdit:
     *                 type: boolean
     *                 default: false
     *     responses:
     *       200:
     *         description: Playlist shared successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    sharePlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;
            const shareData: SharePlaylistDto = req.body;

            const result = await this.playlistService.sharePlaylist(playlistId, shareData, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist shared successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}/unshare:
     *   post:
     *     summary: Unshare playlist with users
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userIds
     *             properties:
     *               userIds:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         description: Playlist unshared successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    unsharePlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;
            const { userIds } = req.body;

            const result = await this.playlistService.unsharePlaylist(playlistId, userIds, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist unshared successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/{id}/play:
     *   post:
     *     summary: Play playlist (increment play count)
     *     tags: [Playlist]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Playlist played successfully
     *       404:
     *         description: Playlist not found
     *       403:
     *         description: Access denied
     */
    playPlaylist = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user._id.toString();
            const playlistId = req.params.id;

            const result = await this.playlistService.playPlaylist(playlistId, userId);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Playlist played successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };

    /**
     * @swagger
     * /v1/playlists/search:
     *   get:
     *     summary: Search playlists
     *     tags: [Playlist]
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *       - in: query
     *         name: owner
     *         schema:
     *           type: string
     *       - in: query
     *         name: visibility
     *         schema:
     *           type: string
     *           enum: [private, public, shared]
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: Search results retrieved successfully
     */
    searchPlaylists = async (req: Request, res: Response): Promise<void> => {
        try {
            const searchParams: PlaylistSearchDto = {
                name: req.query.name as string,
                owner: req.query.owner as string,
                visibility: req.query.visibility as any,
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10
            };

            const result = await this.playlistService.searchPlaylists(searchParams);

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: "Search results retrieved successfully",
                data: result
            });
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        }
    };


}


