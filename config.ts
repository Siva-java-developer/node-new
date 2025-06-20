import dotenv from 'dotenv'
import { JwtUtils } from './utils/jwt.utils';
dotenv.config();

// DECLARE ALL VARIABLES
const MONGO_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/user-management';
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Get RSA keys for JWT
const { privateKey, publicKey } = JwtUtils.getRsaKeys();

//CREATE CONFIG OBJECT
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
    }
};

//CHECK FOR ENVIRONMENT
// if (NODE_ENV === 'production') {
//     config.mongo.url = MONGO_URL;
//     config.server.port = SERVER_PORT;
// } else if (NODE_ENV === 'local') {
//     config.mongo.url = MONGO_URL_LOCAL;
//     config.server.port = SERVER_PORT;
// }

//EXPORT
export default config;