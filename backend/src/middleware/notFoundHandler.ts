import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    message: 'Route not found',
    errors: [`The requested endpoint ${req.method} ${req.path} does not exist`]
  };

  res.status(404).json(response);
};