import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/HttpStatus.js';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

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
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

