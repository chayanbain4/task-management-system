import type { Request, Response } from 'express';
import { env } from '../config/env.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
} as const;

// clearCookie options without maxAge (Express v5 deprecation fix)
const clearCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/auth'
} as const;

export const attachRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, refreshTokenCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, clearCookieOptions);
};

export const getRefreshTokenFromCookies = (cookieBag: Record<string, string> | undefined) => {
  return cookieBag?.[REFRESH_TOKEN_COOKIE];
};

export const getRefreshTokenFromRequest = (req: Request) => {
  return req.body?.refreshToken || req.cookies?.[REFRESH_TOKEN_COOKIE];
};