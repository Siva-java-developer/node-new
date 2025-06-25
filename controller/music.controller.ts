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
     *     summary: Get all music entries
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
     *     responses:
     *       200:
     *         description: List of all music entries
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
     */
    getAllMusic = asyncHandler(async (req: Request, res: Response) => {
        // Check if userId is provided in query params for favorite status
        const userId = req.query.userId as string;
        
        if (userId) {
            // Get all music with favorite status
            try {
                const musicWithFavorites = await this.musicService.getAllMusicWithFavoriteStatus(userId);
                
                // Transform the result to include isFavorite in each music object
                const transformedMusic = musicWithFavorites.map(item => ({
                    ...item.music.toObject(),
                    isFavorite: item.isFavorite
                }));
                
                res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: transformedMusic
                });
            } catch (error: any) {
                if (error instanceof CustomError) {
                    throw error;
                }
                // If there's an error with favorite status, fall back to regular music retrieval
                const music = await this.musicService.getAllMusic();
                res.status(HTTPStatusCode.Ok).json({
                    success: true,
                    data: music
                });
            }
        } else {
            // Regular music retrieval without favorite status
            const music = await this.musicService.getAllMusic();
            res.status(HTTPStatusCode.Ok).json({
                success: true,
                data: music
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
     *   post:
     *     summary: Filter music by criteria
     *     tags: [Music]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               language:
     *                 type: string
     *               syllabus:
     *                 type: string
     *               subject:
     *                 type: string
     *               class:
     *                 type: string
     *     responses:
     *       200:
     *         description: Filtered music entries
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
     *                     $ref: '#/components/schemas/Music'
     */
    filterMusic = asyncHandler(async (req: Request, res: Response) => {
        const filter = req.body;
        const music = await this.musicService.findMusic(filter);
        res.status(HTTPStatusCode.Ok).json({
            success: true,
            data: music
        });
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
}