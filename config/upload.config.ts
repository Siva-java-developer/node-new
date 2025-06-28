/**
 * Configuration for file uploads
 * All sizes are in bytes
 */

import config from '../config';

export const UPLOAD_CONFIG = {
    // Audio file upload configuration
    AUDIO: {
        // File size limits
        SIZE: {
            MIN: 1024, // 1KB
            DEFAULT: config.fileUpload.maxSize, // From environment config
            MAX: 50 * 1024 * 1024 // 50MB
        },
        // Allowed MIME types
        ALLOWED_TYPES: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/aac'
        ],
        // Error messages
        ERRORS: {
            TYPE: 'Only audio files are allowed (MP3, WAV, OGG, AAC)',
            SIZE: `Audio file size must be between 1KB and ${config.fileUpload.maxSize / (1024 * 1024)}MB`
        }
    },
    
    // Image file upload configuration
    IMAGE: {
        // File size limits
        SIZE: {
            MIN: 1024, // 1KB
            DEFAULT: config.fileUpload.maxSize, // From environment config
            MAX: 20 * 1024 * 1024 // 20MB
        },
        // Allowed MIME types
        ALLOWED_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ],
        // Error messages
        ERRORS: {
            TYPE: 'Only image files are allowed (JPEG, PNG, GIF, WEBP)',
            SIZE: `Image file size must be between 1KB and ${config.fileUpload.maxSize / (1024 * 1024)}MB`
        }
    },
    
    // LRC (Lyrics) file upload configuration
    LYRICS: {
        // File size limits
        SIZE: {
            MIN: 10, // 10 bytes
            DEFAULT: 1 * 1024 * 1024, // 1MB
            MAX: 5 * 1024 * 1024 // 5MB
        },
        // Allowed MIME types (text files)
        ALLOWED_TYPES: [
            'text/plain',
            'application/octet-stream', // For .lrc files without specific MIME type
            'text/x-lrc'
        ],
        // Error messages
        ERRORS: {
            TYPE: 'Only LRC lyrics files are allowed (.lrc, .txt)',
            SIZE: `Lyrics file size must be between 10 bytes and 5MB`
        }
    },
    
    // Document file upload configuration (for future use)
    DOCUMENT: {
        // File size limits
        SIZE: {
            MIN: 1024, // 1KB
            DEFAULT: config.fileUpload.maxSize, // From environment config
            MAX: 100 * 1024 * 1024 // 100MB
        },
        // Allowed MIME types
        ALLOWED_TYPES: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ],
        // Error messages
        ERRORS: {
            TYPE: 'Only document files are allowed (PDF, DOC, DOCX, XLS, XLSX, TXT)',
            SIZE: `Document file size must be between 1KB and ${config.fileUpload.maxSize / (1024 * 1024)}MB`
        }
    },
    
    // General upload configuration
    GENERAL: {
        // Maximum number of files per upload
        MAX_FILES: config.fileUpload.maxFiles, // From environment config
        // Maximum field name length
        MAX_FIELD_NAME_SIZE: 100,
        // Maximum field value length
        MAX_FIELD_VALUE_SIZE: 1024 * 1024, // 1MB
        // Error messages
        ERRORS: {
            GENERAL: 'An error occurred during file upload',
            NO_FILE: 'No file was uploaded',
            TOO_MANY_FILES: `Too many files uploaded. Maximum allowed is ${config.fileUpload.maxFiles} files`
        }
    }
};

// Log upload configuration
console.log(`Upload config loaded for environment: ${config.env}`);
console.log(`Max file size: ${config.fileUpload.maxSize / (1024 * 1024)}MB`);
console.log(`Max files: ${config.fileUpload.maxFiles}`);

export default UPLOAD_CONFIG;