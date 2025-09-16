import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  // Server Configuration
  nodeEnv: string;
  port: number;
  apiBaseUrl: string;

  // Database Configuration
  databaseUrl: string;
  testDatabaseUrl: string;

  // Redis Configuration
  redisUrl: string;

  // JWT Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // Email Configuration
  emailFrom: string;
  sendgridApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;

  // File Storage Configuration
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsS3Bucket: string;
  awsCloudFrontUrl: string;

  // Payment Configuration
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePublishableKey: string;

  // Content Moderation
  openaiApiKey?: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // Security
  corsOrigin: string;
  bcryptRounds: number;

  // Upload Limits
  maxFileSize: string;
  maxFilesPerUpload: number;
}

const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY'
];

// Validate required environment variables
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config: Config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL!,
  testDatabaseUrl: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL!,

  // Redis Configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Email Configuration
  emailFrom: process.env.EMAIL_FROM || 'noreply@vipconnect.com',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,

  // File Storage Configuration
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || 'vipconnect-uploads',
  awsCloudFrontUrl: process.env.AWS_CLOUDFRONT_URL || '',

  // Payment Configuration
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',

  // Content Moderation
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Security
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Upload Limits
  maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
  maxFilesPerUpload: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10', 10),
};

// Validate configuration in development
if (config.nodeEnv === 'development') {
  console.log('🔧 Configuration loaded:');
  console.log(`  - Environment: ${config.nodeEnv}`);
  console.log(`  - Port: ${config.port}`);
  console.log(`  - Database: ${config.databaseUrl.replace(/\/\/.*@/, '//***@')}`);
  console.log(`  - Redis: ${config.redisUrl}`);
  console.log(`  - CORS Origin: ${config.corsOrigin}`);
}