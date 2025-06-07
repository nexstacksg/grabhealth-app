import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/error/errorHandler";
import { notFound } from "./middleware/error/notFound";
import routes from "./routes";
import { config } from "./config/env";
import { apiLimiter } from "./middleware/security/rateLimiter";
import logger, { stream } from "./utils/logger";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin?.split(",") || "*",
    credentials: true,
  })
);

// Request logging
app.use(morgan(config.env === "production" ? "combined" : "dev", { stream }));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply general rate limiting to all API routes
app.use("/api", apiLimiter);

// API routes
app.use("/api", routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
