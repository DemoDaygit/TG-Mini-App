import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller.js';
import { authenticateTelegram, rateLimit } from '../middleware/auth.js';

export function createRecommendationRoutes() {
  const router = Router();

  router.use(authenticateTelegram);
  router.use(rateLimit(50, 60000));

  // Get personalized recommendations
  router.get('/', RecommendationController.getRecommendations);

  return router;
}
