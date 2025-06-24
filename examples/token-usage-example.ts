import { TokenUtils } from '../utils/token.utils';
import AuthService from '../service/auth.service';
import Container from 'typedi';
import axios from 'axios';

/**
 * Example of how to use the token utilities directly
 */
async function directTokenUsageExample(token: string) {
    try {
        // Extract user ID from token
        const userId = TokenUtils.getUserIdFromToken(token);
        console.log('User ID:', userId);
        
        // Extract user role from token
        const userRole = TokenUtils.getUserRoleFromToken(token);
        console.log('User Role:', userRole);
        
        // Get full user object from token
        const user = await TokenUtils.getUserFromToken(token);
        console.log('User:', user);
        
        return user;
    } catch (error) {
        console.error('Error processing token:', error);
        throw error;
    }
}

/**
 * Example of how to use the auth service
 */
async function authServiceExample(token: string) {
    try {
        // Get auth service from container
        const authService = Container.get(AuthService);
        
        // Get user from token
        const user = await authService.getLoggedInUser(token);
        console.log('User from Auth Service:', user);
        
        // Get user ID from token
        const userId = authService.getLoggedInUserId(token);
        console.log('User ID from Auth Service:', userId);
        
        // Check if user has admin role
        const isAdmin = authService.hasRole(token, ['admin']);
        console.log('Is Admin:', isAdmin);
        
        return user;
    } catch (error) {
        console.error('Error using auth service:', error);
        throw error;
    }
}

/**
 * Example of how to use the API endpoint
 */
async function apiEndpointExample(token: string) {
    try {
        // Call the API endpoint
        const response = await axios.post('http://localhost:3000/v1/auth/profile/token', {
            token
        });
        
        console.log('User from API:', response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

/**
 * Example of how to extract token from request headers
 */
function extractTokenFromRequestExample(authorizationHeader: string) {
    // Extract token from Authorization header
    const token = TokenUtils.extractTokenFromHeader(authorizationHeader);
    
    if (!token) {
        console.error('No token found in header');
        return null;
    }
    
    console.log('Extracted Token:', token);
    return token;
}

export {
    directTokenUsageExample,
    authServiceExample,
    apiEndpointExample,
    extractTokenFromRequestExample
};