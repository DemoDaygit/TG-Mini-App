import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateTelegram, rateLimit } from '../middleware/auth.js';

const prisma = new PrismaClient();

export function createModuleRoutes() {
  const router = Router();

  router.use(authenticateTelegram);
  router.use(rateLimit(100, 60000));

  // Get all modules
  router.get('/', async (req, res) => {
    try {
      const modules = await prisma.learningModule.findMany({
        select: {
          id: true,
          moduleId: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          estimatedMinutes: true,
          skills: true,
          tags: true,
          completionCount: true,
          averageRating: true
        }
      });

      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch modules' }
      });
    }
  });

  // Get single module with full content
  router.get('/:moduleId', async (req, res) => {
    try {
      const module = await prisma.learningModule.findUnique({
        where: { moduleId: req.params.moduleId }
      });

      if (!module) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Module not found' }
        });
      }

      res.json({ success: true, data: module });
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch module' }
      });
    }
  });

  return router;
}
