"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const swagger_1 = require("./config/swagger");
const user_routes_1 = __importDefault(require("./routers/user.routes"));
const auth_routes_1 = __importDefault(require("./routers/auth.routes"));
const music_routes_1 = __importDefault(require("./routers/music.routes"));
const exception_handler_1 = require("./config/exception.handler");
const page_not_found_exception_1 = require("./config/page-not-found.exception");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// Serve static files from the uploads directory and its subdirectories
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Serve static files from the public directory
app.use('/public', express_1.default.static(path_1.default.join(__dirname, 'public')));
// Swagger Documentation
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true
    },
    customJS: ['/js/swagger-fetch-button.js'] // Add our custom JavaScript
};
// Standard Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
// Custom Swagger UI with fetch button
app.get('/api-docs-custom', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'swagger-ui-custom.html'));
});
// Redirect all old paths to the custom Swagger UI
app.get(['/api-docs-auth', '/api-docs-enhanced', '/api-docs-simple', '/api-docs-fetch'], (req, res) => {
    res.redirect('/api-docs-custom');
});
// Direct user update form - if this file still exists
app.get('/user-update', (req, res) => {
    res.redirect('/api-docs-custom');
});
// Redirect root to custom Swagger UI with fetch button
app.get('/', (req, res) => {
    res.redirect('/api-docs-custom');
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
app.use('/v1/auth', auth_routes_1.default);
app.use('/v1/user', user_routes_1.default);
app.use('/v1/music', music_routes_1.default);
// Error Handlers
app.use('*', page_not_found_exception_1.pageNotFoundExceptionHandler);
app.use(exception_handler_1.exceptionHandler);
// Start Server
app.listen(config_1.default.server.port, () => {
    console.log(`Server running on port ${config_1.default.server.port}`);
    // Connect to MongoDB
    mongoose_1.default
        .connect(config_1.default.mongo.url, { retryWrites: true, w: 'majority' })
        .then(() => {
        console.log('Connected to MongoDB.');
    })
        .catch((error) => {
        console.log('Unable to connect to MongoDB:', error.message);
    });
});
//# sourceMappingURL=index.js.map