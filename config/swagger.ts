import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version,
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
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'username', 'password', 'age', 'gender', 'mobileNumber', 'role', 'class'],
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
              type: 'string'
            },
            uid: {
              type: 'string',
              description: 'Unique identifier'
            }
          }
        },
        UserInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'username', 'password', 'age', 'gender', 'mobileNumber', 'role', 'class'],
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
              type: 'string'
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
              type: 'string'
            },
            uid: {
              type: 'string'
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
        }
      }
    }
  },
  apis: ['./routers/*.ts', './controller/*.ts', './model/*.ts']
};

export const specs = swaggerJsdoc(options);