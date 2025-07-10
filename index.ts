// import 'reflect-metadata';

// import express from 'express';
// import mongoose from 'mongoose';
// import swaggerUi from 'swagger-ui-express';
// import path from 'path';
// import config from './config';
// import { specs } from './config/swagger';

// import userRoutes from './routers/user.routes'
// import cors from "cors";
// import authRoutes from './routers/auth.routes'
// import musicRoutes from './routers/music.routes'
// import playlistRoutes from './routers/playlist.routes'
// import bulkUserRoutes from './routers/bulk-user.routes'
// import { exceptionHandler } from './config/exception.handler';
// import { pageNotFoundExceptionHandler } from './config/page-not-found.exception';

// const app = express();
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// // Serve static files from the uploads directory and its subdirectories
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Serve static files from the public directory
// app.use('/public', express.static(path.join(__dirname, 'public')));

// // Swagger Documentation
// const swaggerOptions = {
//   explorer: true,
//   swaggerOptions: {
//     persistAuthorization: true
//   }
// };

// // Standard Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// // Custom Swagger UI with fetch button
// app.get('/api-docs-custom', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'swagger-ui-custom.html'));
// });

// // Redirect all old paths to the custom Swagger UI
// app.get(['/api-docs-auth', '/api-docs-enhanced', '/api-docs-simple', '/api-docs-fetch'], (req, res) => {
//   res.redirect('/api-docs-custom');
// });

// // Direct user update form - if this file still exists
// app.get('/user-update', (req, res) => {
//   res.redirect('/api-docs-custom');
// });

// // Redirect root to custom Swagger UI with fetch button
// app.get('/', (req, res) => {
//   res.redirect('/api-docs-custom');
// });

// // Serve Swagger JSON
// app.get('/api-docs/swagger.json', (req, res) => {
//   try {
//     res.json(specs);
//   } catch (error) {
//     console.error('Error serving swagger.json:', error);
//     res.status(500).json({ error: 'Failed to generate API documentation' });
//   }
// });

// // Debug endpoint for swagger specs
// app.get('/debug/swagger', (req, res) => {
//   try {
//     res.json({
//       message: 'Swagger specs generated successfully',
//       pathsCount: Object.keys(specs.paths || {}).length,
//       components: Object.keys(specs.components || {}).length
//     });
//   } catch (error) {
//     console.error('Error in debug endpoint:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Test route
// app.get('/test', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: 'API is working'
//     });
// });

// // API Routes
// app.use('/v1/auth', authRoutes);
// app.use('/v1/user', userRoutes);
// app.use('/v1/music', musicRoutes);
// app.use('/v1/playlists', playlistRoutes);
// app.use('/v1/bulk-user', bulkUserRoutes);

// // Additional route mapping for backward compatibility
// app.use('/api/playlists', playlistRoutes);

// // Error Handlers
// app.use('*', pageNotFoundExceptionHandler);
// app.use(exceptionHandler);

// // Start Server
// app.listen(config.server.port, () => {
//     console.log(`Server running on port ${config.server.port}`);
    
//     // Connect to MongoDB
//     mongoose
//     .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
//       .then(() => {
//         console.log('Connected to MongoDB.');
//       })
//       .catch((error) => {
//         console.log('Unable to connect to MongoDB:', error.message);
//       });
// });

import 'reflect-metadata';

import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import config from './config';
import { specs } from './config/swagger';

import userRoutes from './routers/user.routes'
import cors from "cors";
import authRoutes from './routers/auth.routes'
import musicRoutes from './routers/music.routes'
import playlistRoutes from './routers/playlist.routes'
import bulkUserRoutes from './routers/bulk-user.routes'
import { exceptionHandler } from './config/exception.handler';
import { pageNotFoundExceptionHandler } from './config/page-not-found.exception';

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the uploads directory and its subdirectories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const basePath = process.env.NODE_ENV === 'production' ? '/edu-tune' : '';

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Swagger Documentation
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true
  },
  customJS: ['/js/swagger-fetch-button.js'] // Add our custom JavaScript
};

// Standard Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// // Custom Swagger UI with fetch button
// app.get('/api-docs-custom', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'swagger-ui-custom.html'));
// });

// // Redirect all old paths to the custom Swagger UI
// app.get(['/api-docs-auth', '/api-docs-enhanced', '/api-docs-simple', '/api-docs-fetch'], (req, res) => {
//   res.redirect('/api-docs-custom');
// });

// // Direct user update form - if this file still exists
// app.get('/user-update', (req, res) => {
//   res.redirect('/api-docs-custom');
// });

// // Redirect root to custom Swagger UI with fetch button
// app.get('/', (req, res) => {
//   res.redirect('/api-docs-custom');
// });

// // Serve Swagger JSON
// app.get('/api-docs/swagger.json', (req, res) => {
//   res.json(specs);
// });

// // Test route
// app.get('/test', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: 'API is working'
//     });
// });

app.use(`${basePath}/api-docs`, swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

app.get(`${basePath}/api-docs-custom`, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'swagger-ui-custom.html'));
});

app.get([`${basePath}/api-docs-auth`, `${basePath}/api-docs-enhanced`, `${basePath}/api-docs-simple`, `${basePath}/api-docs-fetch`], (req, res) => {
  res.redirect(`${basePath}/api-docs-custom`);
});

app.get(`${basePath}/user-update`, (req, res) => {
  res.redirect(`${basePath}/api-docs-custom`);
});

app.get(`${basePath}/`, (req, res) => {
  res.redirect(`${basePath}/api-docs-custom`);
});

app.get(`${basePath}/api-docs/swagger.json`, (req, res) => {
  res.json(specs);
});

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/user', userRoutes);
app.use('/v1/music', musicRoutes);
app.use('/v1/playlists', playlistRoutes);
app.use('/v1/bulk-user', bulkUserRoutes);

// Additional route mapping for backward compatibility
app.use('/api/playlists', playlistRoutes);

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