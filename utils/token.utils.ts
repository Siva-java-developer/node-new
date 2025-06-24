import * as jwt from 'jsonwebtoken';
import User from '../model/user.model';
import config from '../config';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';
import UserResponseDTO from '../dto/user.dto';

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
    id: string;
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}

/**
 * Utility class for token operations
 */
export class TokenUtils {
    /**
     * Extract and verify JWT token
     * @param token JWT token string
     * @returns Decoded JWT payload
     * @throws CustomError if token is invalid
     */
    static verifyToken(token: string): JwtPayload {
        try {
            // Verify token using RSA public key
            const decoded = jwt.verify(token, config.jwt.publicKey, { 
                algorithms: [config.jwt.algorithm] 
            }) as JwtPayload;
            
            return decoded;
        } catch (error) {
            throw new CustomError('Invalid or expired token', HTTPStatusCode.Unauthorized);
        }
    }

    /**
     * Extract token from Authorization header
     * @param authHeader Authorization header value
     * @returns Token string or null if not found
     */
    static extractTokenFromHeader(authHeader?: string): string | null {
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }
        return null;
    }

    /**
     * Get user from token
     * @param token JWT token string
     * @returns User object
     * @throws CustomError if token is invalid or user not found
     */
    static async getUserFromToken(token: string): Promise<UserResponseDTO> {
        const decoded = this.verifyToken(token);
        
        // Get user from database
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw new CustomError('User not found', HTTPStatusCode.Unauthorized);
        }
        
        return UserResponseDTO.toResponse(user);
    }

    /**
     * Get user ID from token
     * @param token JWT token string
     * @returns User ID
     * @throws CustomError if token is invalid
     */
    static getUserIdFromToken(token: string): string {
        const decoded = this.verifyToken(token);
        return decoded.id;
    }

    /**
     * Get user role from token
     * @param token JWT token string
     * @returns User role
     * @throws CustomError if token is invalid
     */
    static getUserRoleFromToken(token: string): string {
        const decoded = this.verifyToken(token);
        return decoded.role;
    }
}