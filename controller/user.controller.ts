import { Request, Response, NextFunction } from 'express'
import UserService from '../service/user.service'
import { Service } from 'typedi'
import asyncHandler from 'express-async-handler'
import { HTTPStatusCode } from '../config/enum/http-status.code'
import UPLOAD_CONFIG from '../config/upload.config'
import fs from 'fs'
import path from 'path'
import { FavoriteMusicDTO, FavoriteMusicResponseDTO } from '../dto/user.dto'
import { UserRole } from '../model/user.model'
// import CustomError from '../config/custom.error'
// import { ErrorMessages } from '../config/enum/error-messages.enum'

// Interface for user creation data
interface UserCreationData {
   firstName: string;
   lastName: string;
   username: string;
   email: string;
   password: string;
   age: number;
   gender: string;
   mobileNumber: string;
   role: UserRole;
   class: string;
   syllabus: string;
   uid: string;
   profileImage?: string;
}

// Interface for user update data
interface UserUpdateData {
   firstName: string;
   lastName: string;
   username: string;
   email: string;
   age: number;
   gender: string;
   mobileNumber: string;
   role: UserRole;
   class: string;
   syllabus: string;
   profileImage?: string;
}

@Service()
class UserController {
   constructor(private readonly userService: UserService) {}
   
   addUser = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const generateUID = () => {
         return Math.random().toString(36).substring(2, 12);
      };
      
      const userData: UserCreationData = {
         firstName: request.body.firstName,
         lastName: request.body.lastName,
         username: request.body.username,
         email: request.body.email,
         password: request.body.password,
         age: request.body.age,
         gender: request.body.gender,
         mobileNumber: request.body.mobileNumber,
         role: request.body.role,
         class: request.body.class,
         syllabus: request.body.syllabus,
         uid: generateUID()
      };
      
      // Handle profile image if uploaded
      if (request.file) {
         const fileName = request.file.filename;
         const filePath = `/uploads/Profiles/${fileName}`;
         userData.profileImage = filePath;
      }
      
      await this.userService.createUser(userData);
      return response.json({status: true, message: "User saved"});
   });

   getUser = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const users = await this.userService.getUsers();
      return response.json({status: true, data: users});
   });

   getUserById = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const userId = request.params.id;
      const user = await this.userService.getUserById(userId);
      return response.json({status: true, data: user});
   });

   updateUser = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const userId = request.params.id;
      const userData: UserUpdateData = {
         firstName: request.body.firstName,
         lastName: request.body.lastName,
         username: request.body.username,
         email: request.body.email,
         age: request.body.age,
         gender: request.body.gender,
         mobileNumber: request.body.mobileNumber,
         role: request.body.role,
         class: request.body.class,
         syllabus: request.body.syllabus
      };
      
      // Handle profile image if uploaded
      if (request.file) {
         const fileName = request.file.filename;
         const filePath = `/uploads/Profiles/${fileName}`;
         userData.profileImage = filePath;
         
         // If replacing an existing profile image, delete the old one
         const user = await this.userService.getUserById(userId);
         if (user && user.profileImage) {
            try {
               const oldImagePath = user.profileImage.split('/').pop(); // Get filename from path
               if (oldImagePath) {
                  const fullPath = path.join(__dirname, '..', 'uploads', 'Profiles', oldImagePath);
                  if (fs.existsSync(fullPath)) {
                     fs.unlinkSync(fullPath);
                  }
               }
            } catch (error) {
               console.error('Error deleting old profile image:', error);
               // Continue with update even if old image deletion fails
            }
         }
      }
      
      await this.userService.updateUser(userId, userData);
      return response.json({status: true, message: "User updated"});
   });

   deleteUser = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const userId = request.params.id;
      
      // Get user to check if they have a profile image
      try {
         const user = await this.userService.getUserById(userId);
         if (user && user.profileImage) {
            const imagePath = user.profileImage.split('/').pop(); // Get filename from path
            if (imagePath) {
               const fullPath = path.join(__dirname, '..', 'uploads', 'Profiles', imagePath);
               if (fs.existsSync(fullPath)) {
                  fs.unlinkSync(fullPath);
               }
            }
         }
      } catch (error) {
         console.error('Error deleting profile image during user deletion:', error);
         // Continue with user deletion even if image deletion fails
      }
      
      await this.userService.deleteUser(userId);
      return response.json({status: true, message: "User deleted"});
   });

   // Profile image download functionality
   /**
    * @swagger
    * /v1/user/{userId}/profile-image:
    *   get:
    *     summary: Download user profile image by user ID
    *     tags: [Users]
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: userId
    *         required: true
    *         schema:
    *           type: string
    *         description: User ID
    *     responses:
    *       200:
    *         description: Profile image file
    *         content:
    *           image/jpeg:
    *             schema:
    *               type: string
    *               format: binary
    *           image/png:
    *             schema:
    *               type: string
    *               format: binary
    *           image/gif:
    *             schema:
    *               type: string
    *               format: binary
    *           image/webp:
    *             schema:
    *               type: string
    *               format: binary
    *       404:
    *         description: User or image not found
    *       500:
    *         description: Internal server error
    */
   downloadProfileImageByUserId = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      
      if (!userId) {
         return res.status(HTTPStatusCode.BadRequest).json({
            success: false,
            message: 'User ID is required'
         });
      }
      
      try {
         // Get user to find their profile image
         const user = await this.userService.getUserById(userId);
         
         if (!user) {
            return res.status(HTTPStatusCode.NotFound).json({
               success: false,
               message: 'User not found'
            });
         }
         
         if (!user.profileImage) {
            return res.status(HTTPStatusCode.NotFound).json({
               success: false,
               message: 'User has no profile image'
            });
         }
         
         // Extract filename from the profile image path
         const filename = user.profileImage.split('/').pop();
         if (!filename) {
            return res.status(HTTPStatusCode.NotFound).json({
               success: false,
               message: 'Invalid profile image path'
            });
         }
         
         const filePath = path.join(__dirname, '..', 'uploads', 'Profiles', filename);
         
         // Check if file exists
         if (!fs.existsSync(filePath)) {
            return res.status(HTTPStatusCode.NotFound).json({
               success: false,
               message: 'Profile image file not found'
            });
         }
         
         // Get file stats to set proper headers
         const stat = fs.statSync(filePath);
         const fileExtension = path.extname(filename).toLowerCase();
         
         // Set content type based on file extension
         let contentType = 'application/octet-stream';
         switch (fileExtension) {
            case '.jpg':
            case '.jpeg':
               contentType = 'image/jpeg';
               break;
            case '.png':
               contentType = 'image/png';
               break;
            case '.gif':
               contentType = 'image/gif';
               break;
            case '.webp':
               contentType = 'image/webp';
               break;
         }
         
         // Set headers
         res.set({
            'Content-Type': contentType,
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            'Content-Disposition': `inline; filename="${filename}"`
         });
         
         // Create read stream and pipe to response
         const readStream = fs.createReadStream(filePath);
         readStream.pipe(res);
         
      } catch (error) {
         console.error('Error downloading profile image by user ID:', error);
         return res.status(HTTPStatusCode.InternalServerError).json({
            success: false,
            message: 'Failed to download profile image'
         });
      }
   });

   /**
    * @swagger
    * /v1/user/{userId}/favorites:
    *   get:
    *     summary: Get user's favorite music
    *     tags: [Users]
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: userId
    *         required: true
    *         schema:
    *           type: string
    *         description: ID of the user
    *     responses:
    *       200:
    *         description: List of user's favorite music
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
    *       404:
    *         description: User not found
    *       500:
    *         description: Internal server error
    */
   getUserFavorites = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      
      try {
         const favorites = await this.userService.getUserFavoriteMusic(userId);
         const favoritesDTO = favorites.map(music => FavoriteMusicResponseDTO.toResponse(music));
         
         return res.status(HTTPStatusCode.Ok).json({
            success: true,
            data: favoritesDTO
         });
      } catch (error: any) {
         return res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
            success: false,
            message: error.message || 'Failed to get favorite music'
         });
      }
   });

   /**
    * @swagger
    * /v1/user/{userId}/favorites:
    *   post:
    *     summary: Add music to user's favorites
    *     tags: [Users]
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: userId
    *         required: true
    *         schema:
    *           type: string
    *         description: ID of the user
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - musicId
    *             properties:
    *               musicId:
    *                 type: string
    *                 description: ID of the music to add to favorites
    *     responses:
    *       200:
    *         description: Music added to favorites successfully
    *       400:
    *         description: Invalid request
    *       404:
    *         description: User or music not found
    *       409:
    *         description: Music already in favorites
    *       500:
    *         description: Internal server error
    */
   addFavorite = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      const { musicId } = req.body as FavoriteMusicDTO;
      
      if (!musicId) {
         return res.status(HTTPStatusCode.BadRequest).json({
            success: false,
            message: 'Music ID is required'
         });
      }
      
      try {
         await this.userService.addFavoriteMusic(userId, musicId);
         
         return res.status(HTTPStatusCode.Ok).json({
            success: true,
            message: 'Music added to favorites successfully'
         });
      } catch (error: any) {
         return res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
            success: false,
            message: error.message || 'Failed to add music to favorites'
         });
      }
   });

   /**
    * @swagger
    * /v1/user/{userId}/favorites/{musicId}:
    *   delete:
    *     summary: Remove music from user's favorites
    *     tags: [Users]
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: userId
    *         required: true
    *         schema:
    *           type: string
    *         description: ID of the user
    *       - in: path
    *         name: musicId
    *         required: true
    *         schema:
    *           type: string
    *         description: ID of the music to remove from favorites
    *     responses:
    *       200:
    *         description: Music removed from favorites successfully
    *       404:
    *         description: User not found
    *       500:
    *         description: Internal server error
    */
   removeFavorite = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      const musicId = req.params.musicId;
      
      try {
         await this.userService.removeFavoriteMusic(userId, musicId);
         
         return res.status(HTTPStatusCode.Ok).json({
            success: true,
            message: 'Music removed from favorites successfully'
         });
      } catch (error: any) {
         return res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
            success: false,
            message: error.message || 'Failed to remove music from favorites'
         });
      }
   });

   /**
    * @swagger
    * /v1/user/{userId}/favorites/{musicId}/check:
    *   get:
    *     summary: Check if music is in user's favorites
    *     tags: [Users]
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: path
    *         name: userId
    *         required: true
    *         schema:
    *           type: string
    *         description: ID of the user
    *       - in: path
    *         name: musicId
    *         required: true
    *         schema:
    *           type: string
    *         description: ID of the music to check
    *     responses:
    *       200:
    *         description: Check result
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: true
    *                 isFavorite:
    *                   type: boolean
    *       404:
    *         description: User not found
    *       500:
    *         description: Internal server error
    */
   checkFavorite = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      const musicId = req.params.musicId;
      
      try {
         const isFavorite = await this.userService.isMusicFavorite(userId, musicId);
         
         return res.status(HTTPStatusCode.Ok).json({
            success: true,
            isFavorite
         });
      } catch (error: any) {
         return res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
            success: false,
            message: error.message || 'Failed to check favorite status'
         });
      }
   });

   // Debug endpoint to check user data
   debugUser = asyncHandler(async (req: Request, res: Response) => {
      const userId = req.params.userId;
      
      try {
         const user = await this.userService.getUserById(userId);
         
         // Also get the raw user data with favorites
         const rawUser = await this.userService.getRawUserWithFavorites(userId);
         
         return res.status(HTTPStatusCode.Ok).json({
            success: true,
            userData: user,
            rawFavorites: rawUser.favorites,
            favoritesCount: rawUser.favorites?.length || 0
         });
      } catch (error: any) {
         return res.status(error.statusCode || HTTPStatusCode.InternalServerError).json({
            success: false,
            message: error.message || 'Failed to get user debug info'
         });
      }
   });
}

export default UserController