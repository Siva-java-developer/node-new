import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { JwtUtils } from './utils/jwt.utils';

// Load environment-specific configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(__dirname, 'environments', envFile);

// Check if environment-specific file exists
if (fs.existsSync(envPath)) {
    console.log(`Loading environment configuration from: ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    // Fall back to default .env file
    console.log('Using default environment configuration');
    dotenv.config();
}

// DECLARE ALL VARIABLES
const MONGO_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/user-management';
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 8111;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// File size configuration (in bytes)
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 5 * 1024 * 1024; // Default: 5MB
const MAX_FILES = process.env.MAX_FILES ? Number(process.env.MAX_FILES) : 5; // Default: 5 files

// Get RSA keys for JWT
const { privateKey, publicKey } = JwtUtils.getRsaKeys();

// CREATE CONFIG OBJECT
const config = {
    mongo: {
        url: MONGO_URL,
    },
    server: {
        port: SERVER_PORT,
    },
    env: NODE_ENV,
    jwt: {
        privateKey,
        publicKey,
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'RS256' as const
    },
    logging: {
        level: LOG_LEVEL
    },
    fileUpload: {
        maxSize: MAX_FILE_SIZE,
        maxFiles: MAX_FILES,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/mp3', 'audio/wav']
    }
};

// Log configuration (excluding sensitive data)
console.log(`Environment: ${NODE_ENV}`);
console.log(`Server Port: ${SERVER_PORT}`);
console.log(`Log Level: ${LOG_LEVEL}`);
console.log(`Max File Size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
console.log(`Max Files: ${MAX_FILES}`);

// EXPORT
export default config;