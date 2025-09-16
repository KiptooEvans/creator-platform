# Creator Platform Setup Guide

This guide will help you set up the Creator Platform development environment on your local machine.

## Prerequisites

### Required Software
- **Node.js** (v18+) - [Download from nodejs.org](https://nodejs.org/)
- **PostgreSQL** (v13+) - [Download from postgresql.org](https://www.postgresql.org/download/)
- **Redis** (v6+) - [Download from redis.io](https://redis.io/download/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Optional Tools
- **Docker** - For containerized development
- **AWS CLI** - For cloud storage and deployment
- **Stripe CLI** - For payment testing

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd creator-platform

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### PostgreSQL Setup
```bash
# Create database
createdb creator_platform_dev

# Create test database
createdb creator_platform_test

# Run migrations
npm run db:migrate

# Seed development data (optional)
npm run db:seed
```

#### Redis Setup
```bash
# Start Redis server
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:6-alpine
```

### 3. Environment Configuration

Create `.env` files in both backend and frontend directories:

#### Backend `.env`
```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000/api/v1

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/creator_platform_dev
TEST_DATABASE_URL=postgresql://username:password@localhost:5432/creator_platform_test

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (SendGrid/SMTP)
EMAIL_FROM=noreply@creatorplatform.com
SENDGRID_API_KEY=your-sendgrid-api-key
# OR for SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=creator-platform-uploads
AWS_CLOUDFRONT_URL=https://your-distribution.cloudfront.net

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Content Moderation
OPENAI_API_KEY=your-openai-api-key (for AI content moderation)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3001
BCRYPT_ROUNDS=12
```

#### Frontend `.env`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-distribution.cloudfront.net
```

## Development Workflow

### Starting the Development Servers

#### Option 1: Start All Services
```bash
# From root directory
npm run dev
```

#### Option 2: Start Services Individually
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Database & Redis (if not running)
redis-server
```

### Available Scripts

#### Root Level
```bash
npm run dev              # Start all services
npm run build            # Build all services
npm run test             # Run all tests
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
```

#### Backend Scripts
```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run db:migrate       # Run database migrations
npm run db:migrate:undo  # Undo last migration
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database (migrate + seed)
```

#### Frontend Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
```

## Database Management

### Migrations
```bash
# Create a new migration
npx sequelize migration:create --name add-new-feature

# Run pending migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Reset database (caution: deletes all data)
npm run db:reset
```

### Seeding
```bash
# Create seed file
npx sequelize seed:create --name demo-users

# Run all seeds
npm run db:seed

# Run specific seed
npx sequelize db:seed --seed demo-users.js

# Undo all seeds
npx sequelize db:seed:undo:all
```

## Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --grep "user authentication"
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test
npm test -- components/Button.test.tsx
```

## Code Quality

### Linting and Formatting
```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking (TypeScript)
npm run type-check
```

### Pre-commit Hooks
The project uses Husky for pre-commit hooks:
- ESLint checks
- Prettier formatting
- TypeScript compilation
- Test execution

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for consistent formatting
- Write meaningful commit messages (Conventional Commits)

### API Development
1. Create route in `backend/routes/`
2. Implement controller in `backend/controllers/`
3. Add validation middleware
4. Write unit tests
5. Update API documentation

### Database Changes
1. Create migration file
2. Update model definitions
3. Add seed data if needed
4. Test migration up/down
5. Update database documentation

### Frontend Development
1. Create components in `frontend/components/`
2. Use React hooks and Context API
3. Implement responsive design
4. Add TypeScript types
5. Write component tests

## Deployment

### Production Environment Variables
Update `.env.production` files with production values:
- Database URLs
- API keys
- Domain names
- Security settings

### Build Process
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Docker Deployment
```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check connection parameters
psql -h localhost -U username -d creator_platform_dev
```

#### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

#### Node Module Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check existing issues in the repository
2. Review logs for error messages
3. Consult the API documentation
4. Ask in team chat or create issue

## Performance Monitoring

### Development Tools
- **Database**: Enable query logging in PostgreSQL
- **API**: Use built-in request logging
- **Frontend**: React DevTools, Lighthouse
- **General**: Browser DevTools, Network tab

### Metrics to Monitor
- API response times
- Database query performance
- Memory usage
- File upload speeds
- User interaction metrics

## Security Considerations

### Development Security
- Never commit secrets to version control
- Use environment variables for sensitive data
- Keep dependencies updated
- Enable CORS only for development domains
- Use HTTPS in production

### Testing Security
- Test authentication flows
- Validate input sanitization
- Check file upload restrictions
- Test rate limiting
- Verify CORS configuration