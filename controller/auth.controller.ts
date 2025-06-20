import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import asyncHandler from 'express-async-handler';
import * as jwt from 'jsonwebtoken';
import User from '../model/user.model';
import config from '../config';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';

@Service()
class AuthController {
    /**
     * Register a new user
     */
    register = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { firstName, lastName, username, email, password, age, gender, mobileNumber, role, class: userClass } = request.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new CustomError('User already exists with this email or username', HTTPStatusCode.BadRequest);
        }

        // Generate UID
        const generateUID = () => {
            return Math.random().toString(36).substring(2, 12);
        };

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password,
            age,
            gender,
            mobileNumber,
            role,
            class: userClass,
            uid: generateUID()
        });

        // Generate JWT token with username and role
        const token = this.generateToken(user);

        // Return user data (without password) and token
        return response.status(HTTPStatusCode.Created).json({
            status: true,
            message: 'User registered successfully',
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    age: user.age,
                    gender: user.gender,
                    mobileNumber: user.mobileNumber,
                    role: user.role,
                    class: user.class,
                    uid: user.uid
                },
                token
            }
        });
    });

    /**
     * Login user
     */
    login = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        const { email, password } = request.body;

        // Check if email and password are provided
        if (!email || !password) {
            throw new CustomError('Please provide email and password', HTTPStatusCode.BadRequest);
        }

        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password is correct
        if (!user || !(await user.comparePassword(password))) {
            throw new CustomError('Invalid credentials', HTTPStatusCode.Unauthorized);
        }

        // Generate JWT token with username and role
        const token = this.generateToken(user);

        // Return user data (without password) and token
        return response.status(HTTPStatusCode.Ok).json({
            status: true,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    age: user.age,
                    gender: user.gender,
                    mobileNumber: user.mobileNumber,
                    role: user.role,
                    class: user.class,
                    uid: user.uid
                },
                token
            }
        });
    });

    /**
     * Get current user profile
     */
    getProfile = asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
        // User is already attached to request by the auth middleware
        const user = (request as any).user;

        return response.status(HTTPStatusCode.Ok).json({
            status: true,
            data: user
        });
    });

    /**
     * Generate JWT token
     */
   private generateToken(user: any): string {
    const privateKey = config.jwt.privateKey;
    const options: jwt.SignOptions = {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
        algorithm: config.jwt.algorithm
    };

    // Include id, username, and role in the token payload
    return jwt.sign({ 
        id: user._id,
        username: user.username,
        role: user.role
    }, privateKey, options);
}
}

export default AuthController;