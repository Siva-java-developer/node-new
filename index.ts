import 'reflect-metadata';

import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import { specs } from './config/swagger';

import userRoutes from './routers/user.routes'
import authRoutes from './routers/auth.routes'
import { exceptionHandler } from './config/exception.handler';
import { pageNotFoundExceptionHandler } from './config/page-not-found.exception';

const app = express();
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/user', userRoutes);

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

