
// ------- Main 


const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger_output.json");
const connectDB = require("./config/db");
const lessonsRoutes = require("./routes/lesRoutes");
const userRoutes = require("./routes/userRoutes");
const offerRoutes = require("./routes/offerRoutes");
const careersRoutes = require("./routes/careersRoutes");
const courseRoutes = require("./routes/courseRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');
const certificationMailsRoutes = require('./routes/emailRoutes');
const careerApplicationRoutes = require('./routes/careerApplicationRoutes');
const categoryMailRoutes = require('./routes/categoryMailRoutes');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize database connection
connectDB();

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", categoryRoutes);
app.use("/api", reviewRoutes);
app.use("/api", userRoutes);
app.use("/api", offerRoutes);
app.use("/api", careersRoutes);
app.use("/api", courseRoutes);
app.use("/api", lessonsRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reviewRoutes);
app.use("/api", contactRoutes);
app.use("/api", careerApplicationRoutes);
app.use("/api", categoryMailRoutes);

const PORT = process.env.PORT || 5000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
