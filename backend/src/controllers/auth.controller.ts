import type { Request, Response, NextFunction } from 'express';
import { loginUser, logoutUser, refreshUserSession, registerUser } from '../services/auth.service.js';
import {
  attachRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest
} from '../services/token.service.js';
import { sendSuccess } from '../utils/http.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await registerUser(req.body);
    attachRefreshTokenCookie(res, session.refreshToken);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await loginUser(req.body);
    attachRefreshTokenCookie(res, session.refreshToken);

    return sendSuccess(res, 200, 'Login successful', {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    const session = await refreshUserSession(refreshToken ?? '');
    attachRefreshTokenCookie(res, session.refreshToken);

    return sendSuccess(res, 200, 'Access token refreshed successfully', {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    await logoutUser(refreshToken);
    clearRefreshTokenCookie(res);

    return sendSuccess(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
};