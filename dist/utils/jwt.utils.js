"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
/**
 * Utility functions for JWT operations with RSA keys
 */
class JwtUtils {
    /**
     * Generate RSA key pair for JWT signing and verification
     * @returns Object containing private and public keys
     */
    static generateRsaKeyPair() {
        const keyPair = (0, crypto_1.generateKeyPairSync)('rsa', {
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
        const keysDir = path_1.default.join(__dirname, '..', 'keys');
        const privateKeyPath = path_1.default.join(keysDir, 'private.key');
        const publicKeyPath = path_1.default.join(keysDir, 'public.key');
        // Create keys directory if it doesn't exist
        if (!fs_1.default.existsSync(keysDir)) {
            fs_1.default.mkdirSync(keysDir, { recursive: true });
        }
        // Check if keys already exist
        if (fs_1.default.existsSync(privateKeyPath) && fs_1.default.existsSync(publicKeyPath)) {
            // Load existing keys
            const privateKey = fs_1.default.readFileSync(privateKeyPath, 'utf8');
            const publicKey = fs_1.default.readFileSync(publicKeyPath, 'utf8');
            return { privateKey, publicKey };
        }
        else {
            // Generate new keys
            const { privateKey, publicKey } = this.generateRsaKeyPair();
            // Save keys to files
            fs_1.default.writeFileSync(privateKeyPath, privateKey);
            fs_1.default.writeFileSync(publicKeyPath, publicKey);
            return { privateKey, publicKey };
        }
    }
}
exports.JwtUtils = JwtUtils;
//# sourceMappingURL=jwt.utils.js.map