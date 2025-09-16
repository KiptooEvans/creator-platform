import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../types';
import { config } from '../config/config';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: string[] = [];

  // Handle different error types
  if (error && typeof error === 'object' && 'statusCode' in error) {
    // Custom API Error
    const apiError = error as ApiError;
    statusCode = apiError.statusCode || 500;
    message = apiError.message || 'An error occurred';
    
    if (apiError.details) {
      errors = Array.isArray(apiError.details) ? apiError.details : [apiError.details];
    } else {
      errors = [message];
    }
  } else if (error.name === 'ValidationError') {
    // Validation errors
    statusCode = 422;
    message = 'Validation Error';
    errors = [error.message];
  } else if (error.name === 'CastError') {
    // Database cast errors (invalid IDs, etc.)
    statusCode = 400;
    message = 'Invalid data format';
    errors = ['Invalid ID format'];
  } else if (error.name === 'MongoServerError' || error.name === 'PostgreSQLError') {
    // Database errors
    statusCode = 500;
    message = 'Database Error';
    errors = config.nodeEnv === 'development' ? [error.message] : ['Database operation failed'];
  } else if (error.message.includes('duplicate key')) {
    // Duplicate key errors
    statusCode = 409;
    message = 'Resource already exists';
    errors = ['This resource already exists'];
  } else if (error.message.includes('not found')) {
    // Not found errors
    statusCode = 404;
    message = 'Resource not found';
    errors = ['The requested resource was not found'];
  } else if (error.name === 'MulterError') {
    // File upload errors
    statusCode = 400;
    message = 'File Upload Error';
    
    switch (error.message) {
      case 'File too large':
        errors = ['File size exceeds the maximum limit'];
        break;
      case 'Too many files':
        errors = ['Too many files uploaded at once'];
        break;
      case 'Unexpected field':
        errors = ['Invalid file field'];
        break;
      default:
        errors = [error.message];
    }
  } else {
    // Generic errors
    errors = config.nodeEnv === 'development' ? [error.message] : ['Something went wrong'];
  }

  // Create error response
  const errorResponse: ApiResponse = {
    success: false,
    message,
    errors
  };

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.data = {
      stack: error.stack,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
  }

  // Log error details
  if (statusCode >= 500) {
    console.error('Internal Server Error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  } else if (config.nodeEnv === 'development') {
    console.warn('Client Error:', {
      error: error.message,
      path: req.path,
      method: req.method,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create custom API error
export const createApiError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};