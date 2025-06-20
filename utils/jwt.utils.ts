import fs from 'fs';
import path from 'path';
import { generateKeyPairSync } from 'crypto';

/**
 * Utility functions for JWT operations with RSA keys
 */
export class JwtUtils {
    /**
     * Generate RSA key pair for JWT signing and verification
     * @returns Object containing private and public keys
     */
    static generateRsaKeyPair() {
        const keyPair = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        return keyPair;
    }

    /**
     * Get RSA keys from files or generate new ones if they don't exist
     * @returns Object containing private and public keys
     */
    static getRsaKeys() {
        const keysDir = path.join(__dirname, '..', 'keys');
        const privateKeyPath = path.join(keysDir, 'private.key');
        const publicKeyPath = path.join(keysDir, 'public.key');

        // Create keys directory if it doesn't exist
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir, { recursive: true });
        }

        // Check if keys already exist
        if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
            // Load existing keys
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
            return { privateKey, publicKey };
        } else {
            // Generate new keys
            const { privateKey, publicKey } = this.generateRsaKeyPair();
            
            // Save keys to files
            fs.writeFileSync(privateKeyPath, privateKey);
            fs.writeFileSync(publicKeyPath, publicKey);
            
            return { privateKey, publicKey };
        }
    }
}