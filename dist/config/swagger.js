"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const package_json_1 = require("../package.json");
;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Management API',
            version: package_json_1.version,
            description: 'API documentation for User Management System',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: '/',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'username', 'password', 'age', 'gender', 'mobileNumber', 'role'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Auto-generated MongoDB ID'
                        },
                        firstName: {
                            type: 'string'
                        },
                        lastName: {
                            type: 'string'
                        },
                        username: {
                            type: 'string',
                            unique: true
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            description: 'Hashed password (not returned in responses)'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            unique: true
                        },
                        age: {
                            type: 'number'
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other']
                        },
                        mobileNumber: {
                            type: 'string'
                        },
                        role: {
                            type: 'string',
                            enum: ['student', 'teacher', 'admin']
                        },
                        class: {
                            type: 'string',
                            description: 'User\'s class (optional)'
                        },
                        syllabus: {
                            type: 'string'
                        },
                        uid: {
                            type: 'string',
                            description: 'Unique identifier'
                        },
                        profileImage: {
                            type: 'string',
                            description: 'Path to user\'s profile image (optional)'
                        }
                    }
                },
                UserInput: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'username', 'password', 'age', 'gender', 'mobileNumber', 'role'],
                    properties: {
                        firstName: {
                            type: 'string'
                        },
                        lastName: {
                            type: 'string'
                        },
                        username: {
                            type: 'string'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 6
                        },
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        age: {
                            type: 'number'
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other']
                        },
                        mobileNumber: {
                            type: 'string'
                        },
                        role: {
                            type: 'string',
                            enum: ['student', 'teacher', 'admin']
                        },
                        class: {
                            type: 'string',
                            description: 'User\'s class (optional)'
                        },
                        syllabus: {
                            type: 'string'
                        },
                        profileImage: {
                            type: 'string',
                            format: 'binary',
                            description: 'User profile image (JPEG, PNG, GIF, WEBP) - optional'
                        }
                    }
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        firstName: {
                            type: 'string'
                        },
                        lastName: {
                            type: 'string'
                        },
                        username: {
                            type: 'string'
                        },
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        age: {
                            type: 'number'
                        },
                        gender: {
                            type: 'string'
                        },
                        mobileNumber: {
                            type: 'string'
                        },
                        role: {
                            type: 'string'
                        },
                        class: {
                            type: 'string',
                            description: 'User\'s class (optional)'
                        },
                        syllabus: {
                            type: 'string'
                        },
                        uid: {
                            type: 'string'
                        },
                        profileImage: {
                            type: 'string',
                            description: 'Path to user\'s profile image (optional)'
                        }
                    }
                },
                CreateMusicDto: {
                    type: 'object',
                    required: ['title', 'language', 'syllabus', 'subject', 'class', 'lyrics', 'music'],
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Title of the music content'
                        },
                        language: {
                            type: 'string',
                            description: 'Language of the music content'
                        },
                        syllabus: {
                            type: 'string',
                            description: 'Educational syllabus the music belongs to'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject related to the music content'
                        },
                        class: {
                            type: 'string',
                            description: 'Class/grade level for which the music is intended'
                        },
                        lyrics: {
                            type: 'string',
                            description: 'Lyrics or text content of the music'
                        },
                        music: {
                            type: 'string',
                            description: 'URL or path to the music file'
                        },
                        duration: {
                            type: 'number',
                            description: 'Duration of the music in seconds'
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'URL or path to the thumbnail image for the music'
                        }
                    }
                },
                UpdateMusicDto: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Updated title of the music content'
                        },
                        language: {
                            type: 'string',
                            description: 'Language of the music content'
                        },
                        syllabus: {
                            type: 'string',
                            description: 'Educational syllabus the music belongs to'
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject related to the music content'
                        },
                        class: {
                            type: 'string',
                            description: 'Class/grade level for which the music is intended'
                        },
                        lyrics: {
                            type: 'string',
                            description: 'Lyrics or text content of the music'
                        },
                        music: {
                            type: 'string',
                            description: 'URL or path to the music file'
                        },
                        duration: {
                            type: 'number',
                            description: 'Duration of the music in seconds'
                        },
                        thumbnail: {
                            type: 'string',
                            description: 'URL or path to the thumbnail image for the music'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string'
                        }
                    }
                },
                FileUploadResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        fileName: {
                            type: 'string',
                            description: 'Generated filename with timestamp'
                        },
                        filePath: {
                            type: 'string',
                            description: 'Path to the uploaded file'
                        },
                        message: {
                            type: 'string',
                            example: 'Music file uploaded successfully'
                        }
                    }
                }
            }
        }
    },
    apis: ['./routers/*.ts', './controller/*.ts', './model/*.ts'],
    consumes: ['multipart/form-data']
};
const generatedSpecs = (0, swagger_jsdoc_1.default)(options);
// Add custom login endpoint for Swagger UI
generatedSpecs.paths['/v1/auth/login'] = Object.assign(Object.assign({}, (generatedSpecs.paths['/v1/auth/login'] || {})), { post: Object.assign(Object.assign({}, (((_a = generatedSpecs.paths['/v1/auth/login']) === null || _a === void 0 ? void 0 : _a.post) || {})), { 'x-swagger-router-controller': 'Authentication', 'x-swagger-form-auth': true, security: [{ ApiKeyAuth: [] }], tags: ['Authentication'], summary: 'User login', description: 'Authenticate a user with email and password', requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['email', 'password'],
                        properties: {
                            email: {
                                type: 'string',
                                format: 'email',
                                example: 'user@example.com'
                            },
                            password: {
                                type: 'string',
                                format: 'password',
                                example: 'string'
                            }
                        }
                    }
                }
            }
        }, responses: {
            '200': {
                description: 'Login successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    description: 'JWT token for authentication'
                                },
                                user: {
                                    $ref: '#/components/schemas/UserResponse'
                                }
                            }
                        }
                    }
                }
            },
            '401': {
                description: 'Invalid credentials',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            }
        } }) });
// Add security definitions to all secured endpoints
Object.keys(generatedSpecs.paths).forEach(path => {
    Object.keys(generatedSpecs.paths[path]).forEach(method => {
        if (generatedSpecs.paths[path][method].security &&
            generatedSpecs.paths[path][method].security.some(sec => sec.bearerAuth)) {
            generatedSpecs.paths[path][method].security = [
                ...generatedSpecs.paths[path][method].security,
                { ApiKeyAuth: [] }
            ];
        }
    });
});
exports.specs = generatedSpecs;
//# sourceMappingURL=swagger.js.map