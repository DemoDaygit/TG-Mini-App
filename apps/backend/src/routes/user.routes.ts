import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateTelegram, rateLimit } from '../middleware/auth.js';

export function createUserRoutes() {
  const router = Router();

  // All routes require authentication
  router.use(authenticateTelegram);
  router.use(rateLimit(100, 60000)); // 100 requests per minute

  // Get current user
  router.get('/me', UserController.getMe);

  // Update user preferences
  router.patch('/me', UserController.updatePreferences);

  return router;
}
