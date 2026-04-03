import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token is missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired access token'));
  }
};
