import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error/errorHandler';
import { notFound } from './middleware/error/notFound';
import routes from './routes';
import { config } from './config/env';
import { apiLimiter } from './middleware/security/rateLimiter';
import { stream } from './utils/logger';
import cacheService from './services/cache/cacheService';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration with explicit settings for cookies
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from configured origins or no origin (like Postman)
      const allowedOrigins = config.cors.origin?.split(',') || [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  })
);

// Request logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev', { stream }));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Debug middleware to log cookies
app.use((req, res, next) => {
  if (req.url.includes('/auth')) {
    console.log('Request to:', req.method, req.url);
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers.cookie);
  }
  next();
});

// Clear empty or invalid cookies middleware
app.use((req, res, next) => {
  // Check if cookies exist and are empty
  if (req.cookies.accessToken === '' || req.cookies.accessToken === undefined) {
    res.clearCookie('accessToken');
  }
  if (req.cookies.refreshToken === '' || req.cookies.refreshToken === undefined) {
    res.clearCookie('refreshToken');
  }
  next();
});

// Health check
app.get('/health', (_req, res) => {
  const cacheStats = cacheService.getStats();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.env,
    cache: {
      backend: cacheService.getBackend(),
      ...cacheStats,
    },
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
