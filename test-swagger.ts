import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { minimalSpecs } from './config/swagger.minimal';

const app = express();
app.use(express.json());

// Simple test endpoint
/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is working"
 */
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(minimalSpecs));

// Serve Swagger JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(minimalSpecs);
});

const PORT = 8112;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});