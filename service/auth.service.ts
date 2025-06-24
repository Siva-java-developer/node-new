import { Service } from 'typedi';
import { TokenUtils } from '../utils/token.utils';
import UserResponseDTO from '../dto/user.dto';
import CustomError from '../config/custom.error';
import { HTTPStatusCode } from '../config/enum/http-status.code';

@Service()
class AuthService {
    /**
     * Get logged-in user from token
     * @param token JWT token string or Authorization header value
     * @returns User object
     * @throws CustomError if token is invalid or user not found
     */
    async getLoggedInUser(token: string): Promise<UserResponseDTO> {
        // Check if token is an Authorization header
        const extractedToken = token.startsWith('Bearer ') 
            ? TokenUtils.extractTokenFromHeader(token) 
            : token;
        
        if (!extractedToken) {
            throw new CustomError('No token provided', HTTPStatusCode.Unauthorized);
        }
        
        // Get user from token
        return await TokenUtils.getUserFromToken(extractedToken);
    }

    /**
     * Get logged-in user ID from token
     * @param token JWT token string or Authorization header value
     * @returns User ID
     * @throws CustomError if token is invalid
     */
    getLoggedInUserId(token: string): string {
        // Check if token is an Authorization header
        const extractedToken = token.startsWith('Bearer ') 
            ? TokenUtils.extractTokenFromHeader(token) 
            : token;
        
        if (!extractedToken) {
            throw new CustomError('No token provided', HTTPStatusCode.Unauthorized);
        }
        
        // Get user ID from token
        return TokenUtils.getUserIdFromToken(extractedToken);
    }

    /**
     * Check if user has required role
     * @param token JWT token string or Authorization header value
     * @param requiredRoles Array of allowed roles
     * @returns Boolean indicating if user has required role
     * @throws CustomError if token is invalid
     */
    hasRole(token: string, requiredRoles: string[]): boolean {
        // Check if token is an Authorization header
        const extractedToken = token.startsWith('Bearer ') 
            ? TokenUtils.extractTokenFromHeader(token) 
            : token;
        
        if (!extractedToken) {
            throw new CustomError('No token provided', HTTPStatusCode.Unauthorized);
        }
        
        // Get user role from token
        const userRole = TokenUtils.getUserRoleFromToken(extractedToken);
        
        // Check if user has required role
        return requiredRoles.includes(userRole);
    }
}

export default AuthService;