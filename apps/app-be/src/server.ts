import { config } from './config/env';
import app from './app';
import logger from './utils/logger';

const PORT = config.port;

// Display startup info immediately
console.log('\n========================================');
console.log('🚀 Starting GrabHealth Backend Server...');
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment: ${config.env}`);
console.log('========================================\n');

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  logger.info('✅ All environment variables validated');
  console.log('\n✅ Server is ready to accept connections!\n');
});
