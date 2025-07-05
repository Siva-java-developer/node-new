import { Request, Response } from 'express';
import { MusicService } from '../service/music.service';
import { CreateMusicDto, UpdateMusicDto } from '../dto/music.dto';
import { HTTPStatusCode } from '../config/enum/http-status.code';
import CustomError from '../config/custom.error';
import asyncHandler from 'express-async-handler';
import path from 'path';
import UPLOAD_CONFIG from '../config/upload.config';
import * as mm from 'music-metadata';
import fs from 'fs';
import sharp from 'sharp';
import { promisify } from 'util';

/**
 * Controller class for handling Music-related HTTP requests
 */
export class MusicController {
    private musicService: MusicService;

    constructor() {
        this.musicService = new MusicService();
    }

    /**
     * @swagger
     * /v1/music:
     *   post:
     *     summary: Create a new music entry
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateMusicDto'
     *     responses:
     *       201:
     *         description: Music created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Music'
     */
    createMusic = asyncHandler(async (req: Request, res: Response) => {
        const musicData: CreateMusicDto = req.body;
        const music = await this.musicService.createMusic(musicData);
        res.status(HTTPStatusCode.Created).json({
            success: true,
            data: music
        });
    });

    /**
     * @swagger
     * /v1/music:
     *   get:
     *     summary: Get all music entries with cursor-based pagination
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: userId
     *         schema:
     *           type: string
     *         required: false
     *         description: Optional user ID to check favorite status for each music
     *       - in: query
     *         name: cursor
     *         schema:
     *           type: string
     *         required: false
     *         description: Cursor for pagination (use the nextCursor value from the previous response to get the next page)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         required: false
     *         description: Number of items to return per page
     *       - in: query
     *         name: sortField
     *         schema:
     *           type: string
     *           default: "_id"
     *           enum: ["_id", "title", "createdAt", "updatedAt"]
     *         required: false
     *         description: Field to sort by
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           default: "asc"
     *           enum: ["asc", "desc"]
     *         required: false
     *         description: Sort order (ascending or descending)
     *     responses:
     *       200:
     *         description: List of music entries with pagination metadata
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     allOf:
     *                       - $ref: '#/components/schemas/Music'
     *                       - type: object
     *                         properties:
     *                           isFavorite:
     *                             type: boolean
     *                             description: Whether the music is in user's favorites (only when userId is provided)
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     hasNextPage:
     *                       type: boolean
     *                       description: Whether there are more items available
     *                     nextCursor:
     *                       type: string
     *                       description: Cursor to use for the next page (only present if hasNextPage is true)
     *                       nullable: true
     *                       example: "60d21b4667d0d8992e610c85"
     *                     totalCount:
     *                       type: integer
     *                       description: Total number of items matching the query (without pagination)
     *                       example: 150
     *                     currentCount:
     *                       type: integer
     *                       description: Number of items in the current page
     *                       example: 10
     *                     limit:
     *                       type: integer
     *                       description: Requested limit per page
     *                       example: 10
     */
    getAllMusic = asyncHandler(async (req: Request, res: Response) => {
        // Extract pagination parameters from query
        const cursor = req.query.cursor as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const sortField = (req.query.sortField as string) || '_id';
        const sortOrder = ((req.query.sortOrder as string) || 'asc') as 'asc' | 'desc';
        
        // Validate limit to prevent performance issues
        const validatedLimit = Math.min(Math.max(1, limit), 100);
        
        // Check if userId is provided in query params for favorite status
        const userId = req.query.userId as string;
        
        if (userId) {
            // Get music with favorite status and pagination
            try {
                // First get paginated music data
                const paginatedResult = await this.musicService.findMusicWithPagination(
                    {}, // empty filter to get all music
                    cursor,
                    validatedLimit,
                    sortField,
                    sortOrder
                );
                
                // Then check favorite status for each music item
                const musicWithFavorites = await this.musicService.getAllMusicWithFavoriteStatus(userId);
                
                // Create a map of music IDs to favorite status for efficient lookup
                const favoriteStatusMap = new Map(
                    musicWithFavorites.map(item => [item.music._id.toString(), item.isFavorite])
                );
                
                // Transform the paginated results to include isFavorite
                const transformedMusic = paginatedResult.data.map(music => ({
                    ...music.toObject(),
                    isFavorite: favoriteStatusMap.get(music._id.toString()) || false
                }));
                
                // Prepare pagination info with nextCursor only if there's a next page
                const paginationInfo = {
                    hasNextPage: paginatedResult.hasNextPage,
                    totalCount: paginatedResult.totalCount,
                    currentCount: paginatedResult.data.length,
                    limit: validatedLimit
                };
                
                // Only include nextCursor if there are more pages
                if (paginatedResult.hasNextPage && paginatedResult.nextCursor) {
                    Object.assign(paginationInfo, { nextCursor: paginatedResult.nextCursor });
                }
                
                res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: transformedMusic,
                    pagination: paginationInfo
                });
            } catch (error: any) {
                if (error instanceof CustomError) {
                    throw error;
                }
                // If there's an error with favorite status, fall back to regular paginated music retrieval
                const paginatedResult = await this.musicService.findMusicWithPagination(
                    {}, 
                    cursor,
                    validatedLimit,
                    sortField,
                    sortOrder
                );
                
                // Prepare pagination info with nextCursor only if there's a next page
                const paginationInfo = {
                    hasNextPage: paginatedResult.hasNextPage,
                    totalCount: paginatedResult.totalCount,
                    currentCount: paginatedResult.data.length,
                    limit: validatedLimit
                };
                
                // Only include nextCursor if there are more pages
                if (paginatedResult.hasNextPage && paginatedResult.nextCursor) {
                    Object.assign(paginationInfo, { nextCursor: paginatedResult.nextCursor });
                }
                
                res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: paginatedResult.data,
                    pagination: paginationInfo
                });
            }
        } else {
            // Regular paginated music retrieval without favorite status
            const paginatedResult = await this.musicService.findMusicWithPagination(
                {}, 
                cursor,
                validatedLimit,
                sortField,
                sortOrder
            );
            
            // Prepare pagination info with nextCursor only if there's a next page
            const paginationInfo = {
                hasNextPage: paginatedResult.hasNextPage,
                totalCount: paginatedResult.totalCount,
                nextCursor: paginatedResult.nextCursor || null,
                currentCount: paginatedResult.data.length,
                limit: validatedLimit
            };
            
            // Only include nextCursor if there are more pages
            if (paginatedResult.hasNextPage && paginatedResult.nextCursor) {
                Object.assign(paginationInfo, { nextCursor: paginatedResult.nextCursor });
            }
            
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                data: paginatedResult.data,
                pagination: paginationInfo
            });
        }
    });

    /**
     * @swagger
     * /v1/music/{id}:
     *   get:
     *     summary: Get music by ID
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Music ID
     *       - in: query
     *         name: userId
     *         schema:
     *           type: string
     *         required: false
     *         description: Optional user ID to check favorite status
     *     responses:
     *       200:
     *         description: Music entry found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   allOf:
     *                     - $ref: '#/components/schemas/Music'
     *                     - type: object
     *                       properties:
     *                         isFavorite:
     *                           type: boolean
     *                           description: Whether the music is in user's favorites (only when userId is provided)
     */
    getMusicById = asyncHandler(async (req: Request, res: Response) => {
        // Check if userId is provided in query params for favorite status
        const userId = req.query.userId as string;
        
        if (userId) {
            // Get music with favorite status
            try {
                const result = await this.musicService.getMusicWithFavoriteStatus(req.params.id, userId);
                res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: {
                        ...result.music.toObject(),
                        isFavorite: result.isFavorite
                    }
                });
            } catch (error: any) {
                if (error instanceof CustomError) {
                    throw error;
                }
                // If there's an error with favorite status, fall back to regular music retrieval
                const music = await this.musicService.getMusicById(req.params.id);
                res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: music
                });
            }
        } else {
            // Regular music retrieval without favorite status
            const music = await this.musicService.getMusicById(req.params.id);
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                data: music
            });
        }
    });

    /**
     * @swagger
     * /v1/music/{id}:
     *   put:
     *     summary: Update music by ID
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
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
     *             $ref: '#/components/schemas/UpdateMusicDto'
     *     responses:
     *       200:
     *         description: Music updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Music'
     */
    updateMusic = asyncHandler(async (req: Request, res: Response) => {
        const updateData: UpdateMusicDto = req.body;
        const music = await this.musicService.updateMusic(req.params.id, updateData);
        res.status(HTTPStatusCode.Ok).json({
            success: true,
            data: music
        });
    });

    /**
     * @swagger
     * /v1/music/{id}:
     *   delete:
     *     summary: Delete music by ID
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Music deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     */
    deleteMusic = asyncHandler(async (req: Request, res: Response) => {
        await this.musicService.deleteMusic(req.params.id);
        res.status(HTTPStatusCode.Ok).json({
            success: true,
            message: 'Music deleted successfully'
        });
    });

    /**
     * @swagger
     * /v1/music/upload:
     *   post:
     *     summary: Upload music audio file
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               audioFile:
     *                 type: string
     *                 format: binary
     *                 description: Audio file (MP3, WAV, OGG, AAC)
     *     responses:
     *       200:
     *         description: Music file uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 fileName:
     *                   type: string
     *                   example: audioFile-1234567890.mp3
     *                 filePath:
     *                   type: string
     *                   example: /uploads/Music/audioFile-1234567890.mp3
     *                 duration:
     *                   type: object
     *                   properties:
     *                     seconds:
     *                       type: number
     *                       example: 235.4
     *                     formatted:
     *                       type: string
     *                       example: 03:55
     *                 format:
     *                   type: string
     *                   example: MP3
     *                 bitrate:
     *                   type: string
     *                   example: 320 kbps
     *                 message:
     *                   type: string
     *                   example: Music file uploaded successfully
     *       400:
     *         description: Bad request - file too large or invalid format
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    uploadMusicFile = asyncHandler(async (req: Request, res: Response) => {
        console.log('Upload endpoint hit');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        if (!req.file) {
            console.log('No file found in request');
            res.status(HTTPStatusCode.BadRequest).json({
                success: false,
                message: UPLOAD_CONFIG.GENERAL.ERRORS.NO_FILE
            });
            return;
        }

        const fileName = req.file.filename;
        const filePath = `/uploads/Music/${fileName}`;
        const absoluteFilePath = path.join(__dirname, '..', 'uploads', 'Music', fileName);
        
        console.log('File uploaded successfully:', fileName);
        
        try {
            // Extract metadata from the audio file
            const metadata = await mm.parseFile(absoluteFilePath);
            
            // Calculate duration in different formats
            const durationSeconds = metadata.format.duration || 0;
            const durationFormatted = this.formatDuration(durationSeconds);
            
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                fileName: fileName,
                filePath: filePath,
                duration: {
                    seconds: durationSeconds,
                    formatted: durationFormatted
                },
                format: metadata.format.container || metadata.format.codec,
                bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) + ' kbps' : 'Unknown',
                message: 'Music file uploaded successfully'
            });
        } catch (error) {
            console.error('Error extracting audio metadata:', error);
            
            // Still return success but without duration info
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                fileName: fileName,
                filePath: filePath,
                duration: {
                    seconds: 0,
                    formatted: '00:00'
                },
                message: 'Music file uploaded successfully (could not extract duration)'
            });
        }
    });
    
    /**
     * @swagger
     * /v1/music/upload/thumbnail:
     *   post:
     *     summary: Upload thumbnail image for music
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               imageFile:
     *                 type: string
     *                 format: binary
     *                 description: Image file (JPEG, PNG, GIF, WEBP)
     *     responses:
     *       200:
     *         description: Thumbnail uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 fileName:
     *                   type: string
     *                   example: thumbnail-1234567890.jpg
     *                 filePath:
     *                   type: string
     *                   example: /uploads/Music/thumbnails/thumbnail-1234567890.jpg
     *                 message:
     *                   type: string
     *                   example: Thumbnail uploaded successfully
     *       400:
     *         description: Bad request - file too large or invalid format
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    uploadThumbnail = asyncHandler(async (req: Request, res: Response) => {
        console.log('Thumbnail upload endpoint hit');
        console.log('Request file:', req.file);
        
        if (!req.file) {
            console.log('No file found in request');
            res.status(HTTPStatusCode.BadRequest).json({
                success: false,
                message: UPLOAD_CONFIG.GENERAL.ERRORS.NO_FILE
            });
            return;
        }

        try {
            // The file is already saved in the correct directory by the musicThumbnailUpload middleware
            // We'll just use the original file without processing
            
            const fileName = req.file.filename;
            const filePath = req.file.path;
            const publicPath = `/uploads/Music/thumbnails/${fileName}`;
            
            // Return success response with file information
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                fileName: fileName,
                filePath: publicPath,
                message: 'Thumbnail uploaded successfully'
            });
        } catch (error: any) {
            console.error('Error uploading thumbnail:', error);
            
            // We won't try to delete the file here to avoid permission errors
            
            res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: `Error uploading thumbnail: ${error.message}`
            });
        }
    });

    /**
     * @swagger
     * /v1/music/thumbnail/{fileName}:
     *   get:
     *     summary: Download a music thumbnail
     *     tags: [Music]
     *     parameters:
     *       - in: path
     *         name: fileName
     *         required: true
     *         schema:
     *           type: string
     *         description: The filename of the thumbnail to download
     *     responses:
     *       200:
     *         description: Thumbnail file
     *         content:
     *           image/*:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Thumbnail not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    downloadThumbnail = asyncHandler(async (req: Request, res: Response) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '..', 'uploads', 'Music', 'thumbnails', fileName);
        
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new CustomError('Thumbnail not found', HTTPStatusCode.NotFound);
            }
            
            // Set appropriate content type based on file extension
            const ext = path.extname(fileName).toLowerCase();
            let contentType = 'image/jpeg'; // Default
            
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';
            
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
            
            // Stream the file to the response
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: `Error downloading thumbnail: ${error.message}`
                });
            }
        }
    });
    
    /**
     * @swagger
     * /v1/music/thumbnail/{fileName}:
     *   delete:
     *     summary: Delete a music thumbnail
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fileName
     *         required: true
     *         schema:
     *           type: string
     *         description: The filename of the thumbnail to delete
     *     responses:
     *       200:
     *         description: Thumbnail deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Thumbnail deleted successfully
     *       404:
     *         description: Thumbnail not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    deleteThumbnail = asyncHandler(async (req: Request, res: Response) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '..', 'uploads', 'Music', 'thumbnails', fileName);
        
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new CustomError('Thumbnail not found', HTTPStatusCode.NotFound);
            }
            
            // Delete the file
            fs.unlinkSync(filePath);
            
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: 'Thumbnail deleted successfully'
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
                    message: `Error deleting thumbnail: ${error.message}`
                });
            }
        }
    });

    /**
     * Format duration in seconds to MM:SS or HH:MM:SS format
     */
    private formatDuration(seconds: number): string {
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

    /**
     * @swagger
     * /v1/music/filter:
     *   get:
     *     summary: Filter music by criteria with cursor-based pagination
     *     tags: [Music]
     *     parameters:
     *       - in: query
     *         name: language
     *         schema:
     *           type: string
     *         description: Filter by language
     *       - in: query
     *         name: syllabus
     *         schema:
     *           type: string
     *         description: Filter by syllabus
     *       - in: query
     *         name: subject
     *         schema:
     *           type: string
     *         description: Filter by subject
     *       - in: query
     *         name: class
     *         schema:
     *           type: string
     *         description: Filter by class/grade level
     *       - in: query
     *         name: title
     *         schema:
     *           type: string
     *         description: Filter by title (partial match)
     *       - in: query
     *         name: cursor
     *         schema:
     *           type: string
     *         description: Cursor for pagination (use nextCursor from previous response)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of items per page
     *       - in: query
     *         name: sortField
     *         schema:
     *           type: string
     *           enum: [_id, title, createdAt, updatedAt]
     *           default: _id
     *         description: Field to sort by
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: asc
     *         description: Sort order
     *     responses:
     *       200:
     *         description: Filtered music entries with pagination
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Music'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     hasNextPage:
     *                       type: boolean
     *                       example: true
     *                     nextCursor:
     *                       type: string
     *                       nullable: true
     *                       example: "507f1f77bcf86cd799439011"
     *                       description: "Cursor for next page, null if no next page"
     *                     totalCount:
     *                       type: integer
     *                       example: 150
     *                     currentCount:
     *                       type: integer
     *                       example: 10
     *                     limit:
     *                       type: integer
     *                       example: 10
     *                 filters:
     *                   type: object
     *                   description: Applied filters
     */
    filterMusic = asyncHandler(async (req: Request, res: Response) => {
        // Extract filter parameters from query
        const { cursor, limit, sortField, sortOrder, ...filterParams } = req.query;
        
        // Build filter object, excluding empty values
        const filter: Record<string, any> = {};
        Object.entries(filterParams).forEach(([key, value]) => {
            if (value && typeof value === 'string' && value.trim() !== '') {
                // Handle title with partial matching
                if (key === 'title') {
                    filter[key] = { $regex: value.trim(), $options: 'i' };
                } else {
                    filter[key] = value.trim();
                }
            }
        });

        // Parse pagination parameters
        const pageLimit = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100);
        const field = (sortField as string) || '_id';
        const order = (sortOrder as 'asc' | 'desc') || 'asc';
        
        // Validate sort field
        const allowedSortFields = ['_id', 'title', 'createdAt', 'updatedAt'];
        const validSortField = allowedSortFields.includes(field) ? field : '_id';

        try {
            const result = await this.musicService.findMusicWithPagination(
                filter,
                cursor as string,
                pageLimit,
                validSortField,
                order
            );

            res.status(HTTPStatusCode.Ok).json({
                success: true,
                data: result.data,
                pagination: {
                    hasNextPage: result.hasNextPage,
                    nextCursor: result.nextCursor || null,
                    totalCount: result.totalCount,
                    currentCount: result.data.length,
                    limit: pageLimit
                },
                filters: filter
            });
        } catch (error: any) {
            res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: `Error filtering music: ${error.message}`
            });
        }
    });

    /**
     * @swagger
     * /v1/music/file/{filename}:
     *   get:
     *     summary: Get music file by filename with content as byte array
     *     tags: [Music]
     *     parameters:
     *       - in: path
     *         name: filename
     *         required: true
     *         schema:
     *           type: string
     *         description: Filename or part of the filename to search for
     *     responses:
     *       200:
     *         description: Music file content and metadata
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:

     *                     fileContent:
     *                       type: string
     *                       format: byte
     *                       description: Base64 encoded file content
     *                     duration:
     *                       type: object
     *                       properties:
     *                         seconds:
     *                           type: number
     *                         formatted:
     *                           type: string
     *                     fileType:
     *                       type: string
     *                       description: MIME type of the file
     *       404:
     *         description: Music not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    getMusicByFilename = asyncHandler(async (req: Request, res: Response) => {
        try {
            const filename = req.params.filename;
            
            // Get the music document from the database
            const music = await this.musicService.getMusicByFilename(filename);
            
            // Get the actual file path from the music document
            const musicFilePath = music.music;
            let absoluteFilePath;
            
            // Check if the music path is already absolute or relative
            if (path.isAbsolute(musicFilePath)) {
                absoluteFilePath = musicFilePath;
            } else {
                // If it's a relative path (like /uploads/Music/filename.mp3)
                // Remove leading slash if present
                const relativePath = musicFilePath.startsWith('/') ? musicFilePath.substring(1) : musicFilePath;
                absoluteFilePath = path.join(__dirname, '..', relativePath);
            }
            
            // Check if file exists
            if (!fs.existsSync(absoluteFilePath)) {
                // Try to find the file in the uploads directory
                const uploadDir = path.join(__dirname, '..', 'uploads', 'Music');
                const files = fs.readdirSync(uploadDir);
                
                // Find a file that contains the filename
                const matchingFile = files.find(file => file.includes(filename));
                
                if (matchingFile) {
                    absoluteFilePath = path.join(uploadDir, matchingFile);
                } else {
                    throw new CustomError('Music file not found on disk', HTTPStatusCode.NotFound);
                }
            }
            
            // Read the file content
            const fileContent = fs.readFileSync(absoluteFilePath);
            
            // Get file metadata
            const metadata = await mm.parseFile(absoluteFilePath);
            
            // Calculate duration
            const durationSeconds = metadata.format.duration || 0;
            const durationFormatted = this.formatDuration(durationSeconds);
            
            // Determine file type
            const fileType = metadata.format.container || metadata.format.codec || path.extname(absoluteFilePath).substring(1);
            
            // Return the file content as base64 and metadata
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                data: {
                    fileContent: fileContent.toString('base64'),
                    duration: {
                        seconds: durationSeconds,
                        formatted: durationFormatted
                    },
                    fileType: fileType,
                    mimeType: `audio/${fileType}`,
                    bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) + ' kbps' : 'Unknown'
                }
            });
        } catch (error: any) {
            console.error(`Error retrieving music file: ${error.message}`);
            res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
                success: false,
                message: error.message || 'Failed to retrieve music file'
            });
        }
    });

    /**
     * @swagger
     * /v1/music/download/{filename}:
     *   get:
     *     summary: Download music file by filename
     *     tags: [Music]
     *     parameters:
     *       - in: path
     *         name: filename
     *         required: true
     *         schema:
     *           type: string
     *         description: Filename or part of the filename to search for
     *     responses:
     *       200:
     *         description: Music file download
     *         content:
     *           audio/*:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Music not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    downloadMusicFile = asyncHandler(async (req: Request, res: Response) => {
        try {
            const filename = req.params.filename;
            
            // Get the music document from the database
            const music = await this.musicService.getMusicByFilename(filename);
            
            // Get the actual file path from the music document
            const musicFilePath = music.music;
            let absoluteFilePath;
            
            // Check if the music path is already absolute or relative
            if (path.isAbsolute(musicFilePath)) {
                absoluteFilePath = musicFilePath;
            } else {
                // If it's a relative path (like /uploads/Music/filename.mp3)
                // Remove leading slash if present
                const relativePath = musicFilePath.startsWith('/') ? musicFilePath.substring(1) : musicFilePath;
                absoluteFilePath = path.join(__dirname, '..', relativePath);
            }
            
            // Check if file exists
            if (!fs.existsSync(absoluteFilePath)) {
                // Try to find the file in the uploads directory
                const uploadDir = path.join(__dirname, '..', 'uploads', 'Music');
                const files = fs.readdirSync(uploadDir);
                
                // Find a file that contains the filename
                const matchingFile = files.find(file => file.includes(filename));
                
                if (matchingFile) {
                    absoluteFilePath = path.join(uploadDir, matchingFile);
                } else {
                    throw new CustomError('Music file not found on disk', HTTPStatusCode.NotFound);
                }
            }
            
            // Get file metadata for content type
            const metadata = await mm.parseFile(absoluteFilePath);
            const fileType = metadata.format.container || metadata.format.codec || path.extname(absoluteFilePath).substring(1);
            const mimeType = `audio/${fileType}`;
            
            // Set headers for file download
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${path.basename(absoluteFilePath)}"`);
            
            // Stream the file to the response
            const fileStream = fs.createReadStream(absoluteFilePath);
            fileStream.pipe(res);
            
        } catch (error: any) {
            console.error(`Error downloading music file: ${error.message}`);
            res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
                success: false,
                message: error.message || 'Failed to download music file'
            });
        }
    });

    /**
     * @swagger
     * /v1/music/file/delete/{filename}:
     *   delete:
     *     summary: Delete music file by filename
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: filename
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the music file to delete (can be partial filename)
     *     responses:
     *       200:
     *         description: Music file deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Music file deleted successfully
     *                 deletedFile:
     *                   type: string
     *                   example: audioFile-1234567890.mp3
     *       404:
     *         description: File not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    deleteMusicFile = asyncHandler(async (req: Request, res: Response) => {
        try {
            const filename = req.params.filename;
            
            if (!filename) {
                return res.status(HTTPStatusCode.BadRequest).json({
                    success: false,
                    message: 'Filename is required'
                });
            }

            const uploadDir = path.join(__dirname, '..', 'uploads', 'Music');
            let fileToDelete: string | null = null;
            let absoluteFilePath: string;

            // First, try to find the exact file
            const exactFilePath = path.join(uploadDir, filename);
            if (fs.existsSync(exactFilePath)) {
                fileToDelete = filename;
                absoluteFilePath = exactFilePath;
            } else {
                // If exact match not found, search for files containing the filename
                try {
                    const files = fs.readdirSync(uploadDir);
                    const matchingFile = files.find(file => file.includes(filename));
                    
                    if (matchingFile) {
                        fileToDelete = matchingFile;
                        absoluteFilePath = path.join(uploadDir, matchingFile);
                    }
                } catch (error) {
                    console.error('Error reading upload directory:', error);
                }
            }

            if (!fileToDelete) {
                return res.status(HTTPStatusCode.NotFound).json({
                    success: false,
                    message: 'Music file not found'
                });
            }

            // Delete the file
            fs.unlinkSync(absoluteFilePath);
            
            return res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: 'Music file deleted successfully',
                deletedFile: fileToDelete
            });

        } catch (error: any) {
            console.error('Error deleting music file:', error);
            return res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: 'Failed to delete music file'
            });
        }
    });

    /**
     * @swagger
     * /v1/music/upload/lyrics:
     *   post:
     *     summary: Upload lyrics file in LRC format
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               lyricsFile:
     *                 type: string
     *                 format: binary
     *                 description: Lyrics file in LRC format (.lrc, .txt)
     *               musicId:
     *                 type: string
     *                 description: Optional music ID to associate lyrics with
     *     responses:
     *       200:
     *         description: Lyrics file uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 fileName:
     *                   type: string
     *                   example: lyrics-1234567890.lrc
     *                 filePath:
     *                   type: string
     *                   example: /uploads/Music/lyrics/lyrics-1234567890.lrc
     *                 content:
     *                   type: string
     *                   description: The content of the lyrics file
     *                 message:
     *                   type: string
     *                   example: Lyrics file uploaded successfully
     *       400:
     *         description: Bad request - file too large or invalid format
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    uploadLyrics = asyncHandler(async (req: Request, res: Response) => {
        console.log('Lyrics upload endpoint hit');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        if (!req.file) {
            console.log('No file found in request');
            res.status(HTTPStatusCode.BadRequest).json({
                success: false,
                message: UPLOAD_CONFIG.GENERAL.ERRORS.NO_FILE
            });
            return;
        }

        const fileName = req.file.filename;
        const filePath = `/uploads/Music/lyrics/${fileName}`;
        const absoluteFilePath = path.join(__dirname, '..', 'uploads', 'Music', 'lyrics', fileName);
        
        console.log('Lyrics file uploaded successfully:', fileName);
        
        try {
            // Read the content of the lyrics file
            const readFile = promisify(fs.readFile);
            const fileContent = await readFile(absoluteFilePath, 'utf8');
            
            // If musicId is provided, update the music entry with the lyrics file path
            const musicId = req.body.musicId;
            if (musicId) {
                try {
                    await this.musicService.updateMusic(musicId, { lyrics: filePath });
                    console.log(`Updated music ${musicId} with lyrics file ${filePath}`);
                } catch (error) {
                    console.error(`Failed to update music ${musicId} with lyrics:`, error);
                    // Continue with the upload response even if update fails
                }
            }
            
            // Return success response with file information and content
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                fileName: fileName,
                filePath: filePath,
                content: fileContent,
                message: 'Lyrics file uploaded successfully'
            });
        } catch (error: any) {
            console.error('Error processing lyrics file:', error);
            
            res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: `Error processing lyrics file: ${error.message}`
            });
        }
    });

    /**
     * @swagger
     * /v1/music/lyrics/{fileName}:
     *   get:
     *     summary: Download a lyrics file
     *     tags: [Music]
     *     parameters:
     *       - in: path
     *         name: fileName
     *         required: true
     *         schema:
     *           type: string
     *         description: The filename of the lyrics file to download
     *     responses:
     *       200:
     *         description: Lyrics file content
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       404:
     *         description: Lyrics file not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    downloadLyrics = asyncHandler(async (req: Request, res: Response) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '..', 'uploads', 'Music', 'lyrics', fileName);
        
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new CustomError('Lyrics file not found', HTTPStatusCode.NotFound);
            }
            
            // Set appropriate content type
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
            
            // Stream the file to the response
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error: any) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(HTTPStatusCode.InternalServerError).json({
                    success: false,
                    message: `Error downloading lyrics file: ${error.message}`
                });
            }
        }
    });

    /**
     * @swagger
     * /v1/music/lyrics/{fileName}:
     *   delete:
     *     summary: Delete a lyrics file
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fileName
     *         required: true
     *         schema:
     *           type: string
     *         description: The filename of the lyrics file to delete
     *     responses:
     *       200:
     *         description: Lyrics file deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Lyrics file deleted successfully
     *       404:
     *         description: Lyrics file not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    deleteLyrics = asyncHandler(async (req: Request, res: Response) => {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, '..', 'uploads', 'Music', 'lyrics', fileName);
        
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new CustomError('Lyrics file not found', HTTPStatusCode.NotFound);
            }
            
            // Delete the file
            fs.unlinkSync(filePath);
            
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                message: 'Lyrics file deleted successfully'
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
                    message: `Error deleting lyrics file: ${error.message}`
                });
            }
        }
    });

    /**
     * @swagger
     * /v1/music/thumbnails/list:
     *   get:
     *     summary: Get thumbnail files with base64 encoded content (all or filtered by filename array)
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: filenames
     *         schema:
     *           type: array
     *           items:
     *             type: string
     *         style: form
     *         explode: true
     *         example: ["thumbnail-1234567890.jpg", "profile-image.png"]
     *         description: Array of specific filenames to retrieve (optional - if not provided, returns all)
     *     responses:
     *       200:
     *         description: Thumbnail files with base64 encoded content
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       filename:
     *                         type: string
     *                         example: "thumbnail-1751186160714-584250547.webp"
     *                       content:
     *                         type: string
     *                         format: byte
     *                         description: Base64 encoded file content
     *                       mimeType:
     *                         type: string
     *                         example: "image/webp"
     *                       mediaType:
     *                         type: string
     *                         example: "image"
     *                       size:
     *                         type: number
     *                         example: 886
     *                 count:
     *                   type: number
     *                   example: 1
     *                 message:
     *                   type: string
     *                   example: "Thumbnail files downloaded successfully (filtered by 1 requested filenames)"
     *       404:
     *         description: No thumbnail files found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    getThumbnailList = asyncHandler(async (req: Request, res: Response) => {
        try {
            // Handle filenames from query parameters (can be a single string or array)
            let requestedFilenames: string[] = [];
            if (req.query.filenames) {
                if (Array.isArray(req.query.filenames)) {
                    requestedFilenames = req.query.filenames as string[];
                } else {
                    requestedFilenames = [req.query.filenames as string];
                }
            }
            const thumbnailDir = path.join(__dirname, '..', 'uploads', 'Music', 'thumbnails');
            
            // Check if thumbnails directory exists
            if (!fs.existsSync(thumbnailDir)) {
                return res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'No thumbnails directory found'
                });
            }
            
            // Read all files from thumbnails directory
            const files = fs.readdirSync(thumbnailDir);
            
            // Filter only image files (common image extensions)
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
            let thumbnailFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return imageExtensions.includes(ext);
            });
            
            // If specific filenames are requested, filter by those
            if (requestedFilenames && Array.isArray(requestedFilenames) && requestedFilenames.length > 0) {
                thumbnailFiles = thumbnailFiles.filter(file => 
                    requestedFilenames.includes(file)
                );
            }
            
            // Sort files alphabetically
            thumbnailFiles.sort();
            
            // Read file contents and prepare response data
            const thumbnailData = [];
            
            for (const filename of thumbnailFiles) {
                try {
                    const filePath = path.join(thumbnailDir, filename);
                    const fileContent = fs.readFileSync(filePath);
                    const stats = fs.statSync(filePath);
                    const extension = path.extname(filename).toLowerCase();
                    
                    // Determine MIME type
                    let mimeType = 'image/jpeg'; // Default
                    if (extension === '.png') mimeType = 'image/png';
                    else if (extension === '.gif') mimeType = 'image/gif';
                    else if (extension === '.webp') mimeType = 'image/webp';
                    else if (extension === '.bmp') mimeType = 'image/bmp';
                    else if (extension === '.svg') mimeType = 'image/svg+xml';
                    
                    thumbnailData.push({
                        filename,
                        content: fileContent.toString('base64'),
                        mimeType,
                        mediaType: 'image',
                        size: stats.size
                    });
                } catch (fileError) {
                    console.error(`Error reading file ${filename}:`, fileError);
                    // Skip this file and continue with others
                }
            }
            
            const message = requestedFilenames && requestedFilenames.length > 0 
                ? `Thumbnail files downloaded successfully (filtered by ${requestedFilenames.length} requested filenames)`
                : 'All thumbnail files downloaded successfully';
            
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                data: thumbnailData,
                count: thumbnailData.length,
                message
            });
        } catch (error: any) {
            console.error('Error retrieving thumbnail files:', error);
            res.status(HTTPStatusCode.InternalServerError).json({
                success: false,
                message: `Error retrieving thumbnail files: ${error.message}`
            });
        }
    });
}