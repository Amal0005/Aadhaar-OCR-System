import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/HttpStatus.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  if (!statusCode) {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  if (!message) {
    message = 'An unexpected error occurred';
  }

  res.status(statusCode).json({
    success: false,
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

