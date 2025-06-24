import 'reflect-metadata';

import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import config from './config';
import { specs } from './config/swagger';

import userRoutes from './routers/user.routes'
import authRoutes from './routers/auth.routes'
import musicRoutes from './routers/music.routes'
import { exceptionHandler } from './config/exception.handler';
import { pageNotFoundExceptionHandler } from './config/page-not-found.exception';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the uploads directory and its subdirectories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Swagger Documentation
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true
  }
};

// Standard Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Custom Swagger UI with login form
app.get('/api-docs-auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'swagger-ui-login.html'));
});

// Serve Swagger JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(specs);
});

// Test route
app.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is working'
    });
});

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/user', userRoutes);
app.use('/v1/music', musicRoutes);

// Error Handlers
app.use('*', pageNotFoundExceptionHandler);
app.use(exceptionHandler);

// Start Server
app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
    
    // Connect to MongoDB
    mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
      .then(() => {
        console.log('Connected to MongoDB.');
      })
      .catch((error) => {
        console.log('Unable to connect to MongoDB:', error.message);
      });
});

