import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/user.model';
import config from '../config';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';
import asyncHandler from 'express-async-handler';

interface JwtPayload {
    id: string;
    username: string;
    role: string;
}

/**
 * Middleware to protect routes - verifies JWT token and attaches user to request
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        throw new CustomError('Not authorized to access this route', HTTPStatusCode.Unauthorized);
    }

    try {
        // Verify token using RSA public key
        const decoded = jwt.verify(token, config.jwt.publicKey, { 
            algorithms: [config.jwt.algorithm] 
        }) as JwtPayload;

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new CustomError('User not found', HTTPStatusCode.Unauthorized);
        }

        // Attach user to request
        (req as any).user = user;
        next();
    } catch (error) {
        throw new CustomError('Not authorized to access this route', HTTPStatusCode.Unauthorized);
    }
});

/**
 * Middleware to restrict access based on user role
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        
        if (!user || !roles.includes(user.role)) {
            throw new CustomError(
                `User role ${user.role} is not authorized to access this route`,
                HTTPStatusCode.Forbidden
            );
        }
        
        next();
    };
};