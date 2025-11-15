import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Response } from 'express';

const prisma = new PrismaClient();

export class UserController {
  /**
   * Get or create user profile
   */
  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const telegramUser = req.telegramUser!;

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramUser.telegramId) },
        include: {
          progress: {
            include: {
              module: true
            }
          },
          skills: true,
          achievements: true
        }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            telegramId: BigInt(telegramUser.telegramId),
            username: telegramUser.username,
            firstName: telegramUser.firstName,
            lastName: telegramUser.lastName,
            languageCode: telegramUser.languageCode,
            isPremium: telegramUser.isPremium
          },
          include: {
            progress: true,
            skills: true,
            achievements: true
          }
        });
      } else {
        // Update last active
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
          include: {
            progress: {
              include: {
                module: true
              }
            },
            skills: true,
            achievements: true
          }
        });
      }

      // Format response
      const formattedUser = {
        id: user.id,
        telegramId: Number(user.telegramId),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isPremium: user.isPremium,
        profile: {
          level: user.level,
          currentXP: user.currentXP,
          totalXP: user.totalXP,
          learningStyle: user.learningStyle,
          skills: user.skills.map(skill => ({
            skillId: skill.skillId,
            skillName: skill.skillName,
            level: skill.level,
            masteryScore: skill.masteryScore,
            acquiredAt: skill.acquiredAt,
            lastPracticedAt: skill.lastPracticedAt
          })),
          stats: {
            totalModulesCompleted: user.totalModulesCompleted,
            totalTimeSpentMinutes: user.totalTimeSpentMinutes,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            completionRate: user.completionRate
          }
        },
        progress: {
          completedModules: user.progress.map(p => ({
            moduleId: p.moduleId,
            status: p.status,
            completionPercentage: p.completionPercentage,
            timeSpentMinutes: p.timeSpentMinutes,
            lastAccessedAt: p.lastAccessedAt
          })),
          achievements: user.achievements.map(a => ({
            id: a.achievementId,
            type: a.type,
            name: a.name,
            description: a.description,
            earnedAt: a.earnedAt,
            xpReward: a.xpReward
          }))
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastActiveAt: user.lastActiveAt
      };

      return res.json({
        success: true,
        data: formattedUser
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user'
        }
      });
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const telegramUser = req.telegramUser!;
      const { learningStyle } = req.body;

      const user = await prisma.user.update({
        where: { telegramId: BigInt(telegramUser.telegramId) },
        data: {
          learningStyle: learningStyle || undefined
        }
      });

      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update preferences'
        }
      });
    }
  }
}
