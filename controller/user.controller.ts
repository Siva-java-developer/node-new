import { Request, Response, NextFunction } from 'express'
import UserService from '../service/user.service'
import { Service } from 'typedi'
import asyncHandler from 'express-async-handler'
import { HTTPStatusCode } from '../config/enum/http-status.code'
import UPLOAD_CONFIG from '../config/upload.config'
// import CustomError from '../config/custom.error'
// import { ErrorMessages } from '../config/enum/error-messages.enum'

@Service()
class UserController {
   constructor(private readonly userService: UserService) {}
   
   addUser = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const generateUID = () => {
         return Math.random().toString(36).substring(2, 12);
      };
      
      const userData = {
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
      const userData = {
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
      
      await this.userService.updateUser(userId, userData);
      return response.json({status: true, message: "User updated"});
   });

   deleteUser = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
      const userId = request.params.id;
      await this.userService.deleteUser(userId);
      return response.json({status: true, message: "User deleted"});
   });

   /**
    * Upload a profile image
    */
   uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
      console.log('Profile upload endpoint hit');
      console.log('Request file:', req.file);
      
      if (!req.file) {
         return res.status(HTTPStatusCode.BadRequest).json({
            success: false,
            message: UPLOAD_CONFIG.GENERAL.ERRORS.NO_FILE
         });
      }

      const fileName = req.file.filename;
      const filePath = `/uploads/Profiles/${fileName}`;
      
      return res.status(HTTPStatusCode.Ok).json({
         success: true,
         fileName: fileName,
         filePath: filePath,
         message: 'Profile image uploaded successfully'
      });
   });
}

export default UserController