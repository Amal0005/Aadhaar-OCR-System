import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/HttpStatus';
import { ZodError } from 'zod';
import { env } from '../config/env';

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = err as ErrorWithStatus;

  let statusCode = error.statusCode;
  let message = error.message;

  if (err instanceof ZodError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  if (!statusCode) statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  if (!message) message = 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    status: 'error',
    statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
