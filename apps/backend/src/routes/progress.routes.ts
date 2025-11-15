import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateTelegram, rateLimit, AuthenticatedRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export function createProgressRoutes() {
  const router = Router();

  router.use(authenticateTelegram);
  router.use(rateLimit(100, 60000));

  // Update progress for a module
  router.post('/:moduleId', async (req: AuthenticatedRequest, res) => {
    try {
      const telegramUser = req.telegramUser!;
      const { moduleId } = req.params;
      const { completionPercentage, timeSpentMinutes, sectionsCompleted, status } = req.body;

      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramUser.telegramId) }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
      }

      // Upsert progress
      const progress = await prisma.moduleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId
          }
        },
        update: {
          completionPercentage,
          timeSpentMinutes: { increment: timeSpentMinutes || 0 },
          sectionsCompleted,
          status,
          lastAccessedAt: new Date()
        },
        create: {
          userId: user.id,
          moduleId,
          completionPercentage: completionPercentage || 0,
          timeSpentMinutes: timeSpentMinutes || 0,
          sectionsCompleted: sectionsCompleted || [],
          status: status || 'in_progress',
          startedAt: new Date()
        }
      });

      res.json({ success: true, data: progress });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_ERROR', message: 'Failed to update progress' }
      });
    }
  });

  // Complete module
  router.post('/:moduleId/complete', async (req: AuthenticatedRequest, res) => {
    try {
      const telegramUser = req.telegramUser!;
      const { moduleId } = req.params;

      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramUser.telegramId) }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
      }

      // Mark as completed
      const progress = await prisma.moduleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId
          }
        },
        update: {
          status: 'completed',
          completionPercentage: 100,
          completedAt: new Date()
        },
        create: {
          userId: user.id,
          moduleId,
          status: 'completed',
          completionPercentage: 100,
          startedAt: new Date(),
          completedAt: new Date()
        }
      });

      // Award XP
      const xpEarned = 100;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentXP: { increment: xpEarned },
          totalXP: { increment: xpEarned },
          totalModulesCompleted: { increment: 1 }
        }
      });

      res.json({
        success: true,
        data: {
          progress,
          xpEarned
        }
      });
    } catch (error) {
      console.error('Error completing module:', error);
      res.status(500).json({
        success: false,
        error: { code: 'COMPLETION_ERROR', message: 'Failed to complete module' }
      });
    }
  });

  return router;
}
