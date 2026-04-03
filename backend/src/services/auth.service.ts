import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { addDays } from '../utils/date.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true
};

export const registerUser = async (input: { name: string; email: string; password: string }) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new ApiError(400, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    },
    select: userSelect
  });

  return createSession(user.id, user.email, user);
};

export const loginUser = async (input: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return createSession(user.id, user.email, safeUser);
};

export const refreshUserSession = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  return prisma.$transaction(async (tx) => {
    const storedToken = await tx.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      throw new ApiError(401, 'Refresh token not found');
    }

    if (storedToken.expiresAt.getTime() < Date.now()) {
      await tx.refreshToken.deleteMany({ where: { token: refreshToken } });
      throw new ApiError(401, 'Refresh token has expired');
    }

    const deleted = await tx.refreshToken.deleteMany({
      where: { token: refreshToken }
    });

    if (deleted.count !== 1) {
      throw new ApiError(401, 'Refresh token already used or invalid');
    }

    const safeUser = {
      id: storedToken.user.id,
      name: storedToken.user.name,
      email: storedToken.user.email,
      createdAt: storedToken.user.createdAt,
      updatedAt: storedToken.user.updatedAt
    };

    const accessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email
    });

    const newRefreshToken = signRefreshToken({
      userId: storedToken.user.id,
      email: storedToken.user.email
    });

    await tx.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: addDays(new Date(), 7)
      }
    });

    return {
      user: safeUser,
      accessToken,
      refreshToken: newRefreshToken
    };
  });
};

export const logoutUser = async (refreshToken: string | undefined) => {
  if (!refreshToken) return;

  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

const createSession = async <TUser extends { id: string; email: string }>(
  userId: string,
  email: string,
  user: TUser
) => {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: addDays(new Date(), 7)
    }
  });

  return {
    user,
    accessToken,
    refreshToken
  };
};