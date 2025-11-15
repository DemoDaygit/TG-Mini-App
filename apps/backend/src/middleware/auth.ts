import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppData, parseTelegramInitData } from '../utils/telegram.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export interface AuthenticatedRequest extends Request {
  telegramUser?: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
    isPremium: boolean;
  };
}

export const authenticateTelegram = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing Telegram init data'
        }
      });
    }

    // Validate data signature
    const isValid = validateTelegramWebAppData(initData, BOT_TOKEN);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Invalid Telegram signature'
        }
      });
    }

    // Parse user data
    const userData = parseTelegramInitData(initData);

    // Check auth date (should be recent, e.g., within last hour)
    const authDate = parseInt(userData.authDate || '0');
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 3600; // 1 hour

    if (now - authDate > maxAge) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_EXPIRED',
          message: 'Authentication expired'
        }
      });
    }

    req.telegramUser = {
      telegramId: userData.telegramId,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      languageCode: userData.languageCode,
      isPremium: userData.isPremium
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
    });
  }
};

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.telegramUser?.telegramId.toString() || req.ip || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(key);

    if (!record || now > record.resetAt) {
      requestCounts.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests'
        }
      });
    }

    record.count++;
    next();
  };
};
