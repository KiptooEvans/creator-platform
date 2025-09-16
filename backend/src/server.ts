import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import configurations and middleware
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authenticateToken } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import subscriptionRoutes from './routes/subscriptions';
import messageRoutes from './routes/messages';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';

// Import services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';

class VIPConnectServer {
  private app: express.Application;
  private httpServer: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.corsOrigin,
        credentials: true
      }
    });
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMaxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression and logging
    this.app.use(compression());
    
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Request timestamp
    this.app.use((req, res, next) => {
      req.timestamp = new Date().toISOString();
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'VIPConnect API is running',
        timestamp: req.timestamp,
        environment: config.nodeEnv
      });
    });

    // API routes
    const apiV1 = '/api/v1';
    
    // Public routes
    this.app.use(`${apiV1}/auth`, authRoutes);
    
    // Protected routes (require authentication)
    this.app.use(`${apiV1}/users`, authenticateToken, userRoutes);
    this.app.use(`${apiV1}/content`, authenticateToken, contentRoutes);
    this.app.use(`${apiV1}/subscriptions`, authenticateToken, subscriptionRoutes);
    this.app.use(`${apiV1}/messages`, authenticateToken, messageRoutes);
    this.app.use(`${apiV1}/payments`, authenticateToken, paymentRoutes);
    this.app.use(`${apiV1}/admin`, authenticateToken, adminRoutes);

    // API documentation endpoint
    this.app.get(`${apiV1}/docs`, (req, res) => {
      res.json({
        success: true,
        message: 'VIPConnect API Documentation',
        version: '1.0.0',
        endpoints: {
          auth: `${req.protocol}://${req.get('host')}${apiV1}/auth`,
          users: `${req.protocol}://${req.get('host')}${apiV1}/users`,
          content: `${req.protocol}://${req.get('host')}${apiV1}/content`,
          subscriptions: `${req.protocol}://${req.get('host')}${apiV1}/subscriptions`,
          messages: `${req.protocol}://${req.get('host')}${apiV1}/messages`,
          payments: `${req.protocol}://${req.get('host')}${apiV1}/payments`,
          admin: `${req.protocol}://${req.get('host')}${apiV1}/admin`
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeSocketIO(): void {
    this.io.use((socket, next) => {
      // Socket.IO authentication middleware
      const token = socket.handshake.auth.token;
      if (token) {
        // TODO: Verify JWT token
        next();
      } else {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle real-time messaging
      socket.on('join-conversation', (conversationId) => {
        socket.join(`conversation-${conversationId}`);
      });

      socket.on('send-message', (data) => {
        socket.to(`conversation-${data.conversationId}`).emit('new-message', data);
      });

      // Handle live streaming
      socket.on('join-stream', (streamId) => {
        socket.join(`stream-${streamId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseService.initialize();
      console.log('✅ Database connected successfully');

      // Initialize Redis connection
      await RedisService.initialize();
      console.log('✅ Redis connected successfully');

      // Start the server
      this.httpServer.listen(config.port, () => {
        console.log(`🚀 VIPConnect API Server running on port ${config.port}`);
        console.log(`📱 Environment: ${config.nodeEnv}`);
        console.log(`🌐 API Base URL: ${config.apiBaseUrl}`);
        console.log(`📋 Health Check: http://localhost:${config.port}/health`);
        console.log(`📚 API Docs: ${config.apiBaseUrl}/docs`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getIOServer(): SocketIOServer {
    return this.io;
  }
}

// Start the server
const server = new VIPConnectServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
server.start();

export default server;