import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Response } from 'express';
import { RecommendationEngine } from '@ai-learning/shared';
import type { User, LearningModule } from '@ai-learning/types';

const prisma = new PrismaClient();
const recommendationEngine = new RecommendationEngine();

export class RecommendationController {
  /**
   * Get personalized recommendations
   */
  static async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const telegramUser = req.telegramUser!;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get user
      const dbUser = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramUser.telegramId) },
        include: {
          progress: true,
          skills: true,
          achievements: true
        }
      });

      if (!dbUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Get all modules
      const modules = await prisma.learningModule.findMany();

      // Convert to type-safe format
      const user: User = {
        id: dbUser.id,
        telegramId: Number(dbUser.telegramId),
        username: dbUser.username || undefined,
        firstName: dbUser.firstName || undefined,
        lastName: dbUser.lastName || undefined,
        languageCode: dbUser.languageCode || undefined,
        isPremium: dbUser.isPremium,
        profile: {
          level: dbUser.level as any,
          currentXP: dbUser.currentXP,
          totalXP: dbUser.totalXP,
          skills: dbUser.skills.map(s => ({
            skillId: s.skillId,
            skillName: s.skillName,
            level: s.level,
            masteryScore: s.masteryScore,
            practiceCount: s.practiceCount,
            retentionRate: 0.9,
            acquiredAt: s.acquiredAt,
            lastPracticedAt: s.lastPracticedAt
          })),
          learningStyle: dbUser.learningStyle as any,
          preferences: {
            dailyGoalMinutes: 30,
            notificationsEnabled: true,
            preferredDifficulty: 'medium' as any,
            topicsOfInterest: []
          },
          stats: {
            totalModulesCompleted: dbUser.totalModulesCompleted,
            totalTimeSpentMinutes: dbUser.totalTimeSpentMinutes,
            currentStreak: dbUser.currentStreak,
            longestStreak: dbUser.longestStreak,
            averageSessionMinutes: dbUser.totalTimeSpentMinutes / Math.max(dbUser.totalModulesCompleted, 1),
            completionRate: dbUser.completionRate
          }
        },
        progress: {
          completedModules: dbUser.progress.map(p => ({
            moduleId: p.moduleId,
            status: p.status as any,
            startedAt: p.startedAt || new Date(),
            completedAt: p.completedAt || undefined,
            lastAccessedAt: p.lastAccessedAt,
            timeSpentMinutes: p.timeSpentMinutes,
            completionPercentage: p.completionPercentage,
            sectionsCompleted: p.sectionsCompleted,
            exercisesCompleted: [],
            bookmarked: p.bookmarked
          })),
          skillsAcquired: [],
          achievements: [],
          learningPath: {
            recommendedModules: [],
            completedMilestones: []
          }
        },
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
        lastActiveAt: dbUser.lastActiveAt
      };

      const learningModules: LearningModule[] = modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category as any,
        difficulty: m.difficulty as any,
        content: m.content as any,
        estimatedMinutes: m.estimatedMinutes,
        prerequisites: m.prerequisites,
        skills: m.skills,
        tags: m.tags,
        completionCount: m.completionCount,
        averageRating: m.averageRating,
        averageCompletionTime: m.averageCompletionTime,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      }));

      // Generate recommendations
      const recommendations = await recommendationEngine.generateRecommendations(
        user,
        learningModules,
        limit
      );

      return res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'RECOMMENDATION_ERROR',
          message: 'Failed to generate recommendations'
        }
      });
    }
  }
}
