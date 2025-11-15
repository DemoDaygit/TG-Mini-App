/**
 * AI-Powered Recommendation Engine
 * Интеллектуальная система рекомендаций обучающего контента
 */

import type {
  User,
  LearningModule,
  Recommendation,
  RecommendationReason,
  ReasonType,
  RecommendationPriority,
  SkillAssessment,
  ModuleProgress,
  ProgressStatus,
  DifficultyLevel,
  LearningStyle
} from '@ai-learning/types';

// ============================================================================
// Recommendation Engine Core
// ============================================================================

export class RecommendationEngine {
  private readonly WEIGHTS = {
    contentRelevance: 0.30,
    difficultyMatch: 0.20,
    learningStyleFit: 0.15,
    progressVelocity: 0.15,
    peerSuccess: 0.10,
    timeOptimization: 0.10
  };

  /**
   * Генерирует персонализированные рекомендации для пользователя
   */
  async generateRecommendations(
    user: User,
    availableModules: LearningModule[],
    limit: number = 10
  ): Promise<Recommendation[]> {
    const scoredModules = await Promise.all(
      availableModules.map(module => this.scoreModule(user, module))
    );

    // Сортируем по score и берем топ-N
    return scoredModules
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Вычисляет score для модуля относительно пользователя
   */
  private async scoreModule(
    user: User,
    module: LearningModule
  ): Promise<Recommendation> {
    const reasons: RecommendationReason[] = [];

    // 1. Content Relevance - релевантность навыкам пользователя
    const contentRelevance = this.calculateContentRelevance(
      user,
      module,
      reasons
    );

    // 2. Difficulty Match - соответствие сложности
    const difficultyMatch = this.calculateDifficultyMatch(
      user,
      module,
      reasons
    );

    // 3. Learning Style Fit - соответствие стилю обучения
    const learningStyleFit = this.calculateLearningStyleFit(
      user,
      module,
      reasons
    );

    // 4. Progress Velocity - скорость прогресса
    const progressVelocity = this.calculateProgressVelocity(
      user,
      module,
      reasons
    );

    // 5. Peer Success Rate - успешность у похожих пользователей
    const peerSuccess = await this.calculatePeerSuccess(
      user,
      module,
      reasons
    );

    // 6. Time Optimization - оптимизация по времени
    const timeOptimization = this.calculateTimeOptimization(
      user,
      module,
      reasons
    );

    // Вычисляем итоговый score
    const score =
      this.WEIGHTS.contentRelevance * contentRelevance +
      this.WEIGHTS.difficultyMatch * difficultyMatch +
      this.WEIGHTS.learningStyleFit * learningStyleFit +
      this.WEIGHTS.progressVelocity * progressVelocity +
      this.WEIGHTS.peerSuccess * peerSuccess +
      this.WEIGHTS.timeOptimization * timeOptimization;

    // Определяем confidence и estimatedSuccess
    const confidence = this.calculateConfidence(user, module);
    const estimatedSuccess = this.estimateSuccessProbability(
      user,
      module,
      score
    );

    // Определяем приоритет
    const priority = this.determinePriority(score, reasons, user, module);

    return {
      moduleId: module.id,
      score,
      reasons: reasons.sort((a, b) => b.weight - a.weight),
      confidence,
      estimatedSuccess,
      priority
    };
  }

  /**
   * Релевантность контента навыкам пользователя
   */
  private calculateContentRelevance(
    user: User,
    module: LearningModule,
    reasons: RecommendationReason[]
  ): number {
    const userSkills = new Set(
      user.profile.skills.map(s => s.skillId)
    );
    const moduleSkills = new Set(module.skills);

    // Проверяем, все ли prerequisites выполнены
    const hasPrerequisites = module.prerequisites.every(prereq => {
      const progress = user.progress.completedModules.find(
        m => m.moduleId === prereq
      );
      return progress?.status === ProgressStatus.COMPLETED ||
             progress?.status === ProgressStatus.MASTERED;
    });

    if (!hasPrerequisites) {
      reasons.push({
        type: ReasonType.SKILL_GAP,
        description: 'Требуются дополнительные навыки',
        weight: 0.1
      });
      return 0.2;
    }

    // Вычисляем пересечение навыков
    const skillsIntersection = new Set(
      [...moduleSkills].filter(skill => userSkills.has(skill))
    );

    const relevanceScore = skillsIntersection.size / moduleSkills.size;

    // Это следующий логический шаг?
    const isNextStep = this.isNextLogicalStep(user, module);
    if (isNextStep) {
      reasons.push({
        type: ReasonType.NEXT_LOGICAL_STEP,
        description: 'Логичное продолжение вашего пути обучения',
        weight: 0.9
      });
      return Math.max(relevanceScore, 0.85);
    }

    // Закрывает ли gap в skill tree?
    const completesSkillTree = this.completesSkillTree(user, module);
    if (completesSkillTree) {
      reasons.push({
        type: ReasonType.COMPLETES_SKILL_TREE,
        description: 'Завершает важную ветку навыков',
        weight: 0.8
      });
      return Math.max(relevanceScore, 0.75);
    }

    return relevanceScore;
  }

  /**
   * Соответствие сложности модуля уровню пользователя
   */
  private calculateDifficultyMatch(
    user: User,
    module: LearningModule,
    reasons: RecommendationReason[]
  ): number {
    const userLevel = user.profile.level;
    const moduleDifficulty = module.difficulty;
    const preferredDifficulty = user.profile.preferences.preferredDifficulty;

    // Идеальное соответствие
    if (this.isDifficultyMatch(userLevel, moduleDifficulty)) {
      if (moduleDifficulty === preferredDifficulty) {
        return 1.0;
      }
      return 0.8;
    }

    // Модуль слишком простой - низкий score
    if (this.isTooEasy(userLevel, moduleDifficulty)) {
      return 0.3;
    }

    // Модуль слишком сложный - очень низкий score
    if (this.isTooDifficult(userLevel, moduleDifficulty)) {
      reasons.push({
        type: ReasonType.SKILL_GAP,
        description: 'Может быть слишком сложным на текущем уровне',
        weight: 0.2
      });
      return 0.1;
    }

    return 0.5;
  }

  /**
   * Соответствие стилю обучения
   */
  private calculateLearningStyleFit(
    user: User,
    module: LearningModule,
    reasons: RecommendationReason[]
  ): number {
    const learningStyle = user.profile.learningStyle;
    const contentType = module.content.type;

    // Анализируем, подходит ли контент стилю обучения
    const styleMatch = this.matchContentToStyle(learningStyle, contentType);

    if (styleMatch > 0.8) {
      reasons.push({
        type: ReasonType.MATCHES_LEARNING_STYLE,
        description: 'Соответствует вашему стилю обучения',
        weight: 0.7
      });
    }

    return styleMatch;
  }

  /**
   * Анализ скорости прогресса пользователя
   */
  private calculateProgressVelocity(
    user: User,
    module: LearningModule,
    reasons: RecommendationReason[]
  ): number {
    const stats = user.profile.stats;

    // Если пользователь быстро учится - можем предложить более сложные модули
    if (stats.completionRate > 0.8 && stats.averageSessionMinutes > 30) {
      return 1.0;
    }

    // Если медленно - проще модули
    if (stats.completionRate < 0.5) {
      return module.difficulty === DifficultyLevel.EASY ? 1.0 : 0.3;
    }

    return 0.7;
  }

  /**
   * Успешность модуля у похожих пользователей
   */
  private async calculatePeerSuccess(
    user: User,
    module: LearningModule,
    reasons: RecommendationReason[]
  ): Promise<number> {
    // В реальной системе здесь был бы запрос к БД
    // для поиска похожих пользователей и их успешности

    // Пока используем статистику модуля
    const completionRate = module.completionCount > 0
      ? module.averageRating / 5.0
      : 0.5;

    if (completionRate > 0.8) {
      reasons.push({
        type: ReasonType.PEER_SUCCESS,
        description: `${Math.round(completionRate * 100)}% пользователей успешно завершили`,
        weight: 0.6
      });
    }

    return completionRate;
  }

  /**
   * Оптимизация по времени
   */
  private calculateTimeOptimization(
    user: User,
    module: LearningModule,
    reasons: RecommendationReason[]
  ): number {
    const dailyGoal = user.profile.preferences.dailyGoalMinutes;
    const moduleTime = module.estimatedMinutes;

    // Модуль укладывается в дневную цель?
    if (moduleTime <= dailyGoal) {
      reasons.push({
        type: ReasonType.TIME_OPTIMIZED,
        description: `Укладывается в вашу дневную цель (${moduleTime} мин)`,
        weight: 0.5
      });
      return 1.0;
    }

    // Можно разбить на несколько сессий?
    const sessions = Math.ceil(moduleTime / dailyGoal);
    if (sessions <= 3) {
      return 0.7;
    }

    return 0.4;
  }

  /**
   * Вычисляет confidence рекомендации
   */
  private calculateConfidence(user: User, module: LearningModule): number {
    // Confidence зависит от количества данных о пользователе
    const modulesCompleted = user.profile.stats.totalModulesCompleted;

    if (modulesCompleted < 3) return 0.5; // Мало данных
    if (modulesCompleted < 10) return 0.7; // Средне
    return 0.9; // Много данных
  }

  /**
   * Оценка вероятности успешного завершения
   */
  private estimateSuccessProbability(
    user: User,
    module: LearningModule,
    score: number
  ): number {
    const completionRate = user.profile.stats.completionRate;
    return (score + completionRate) / 2;
  }

  /**
   * Определяет приоритет рекомендации
   */
  private determinePriority(
    score: number,
    reasons: RecommendationReason[],
    user: User,
    module: LearningModule
  ): RecommendationPriority {
    // Critical - необходимо для прогресса
    const hasNextStepReason = reasons.some(
      r => r.type === ReasonType.NEXT_LOGICAL_STEP
    );
    if (hasNextStepReason && score > 0.8) {
      return RecommendationPriority.CRITICAL;
    }

    // High - сильно рекомендуется
    if (score > 0.7) {
      return RecommendationPriority.HIGH;
    }

    // Medium
    if (score > 0.5) {
      return RecommendationPriority.MEDIUM;
    }

    // Low
    if (score > 0.3) {
      return RecommendationPriority.LOW;
    }

    return RecommendationPriority.OPTIONAL;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private isNextLogicalStep(user: User, module: LearningModule): boolean {
    // Проверяем, является ли модуль логическим продолжением
    // последнего завершенного модуля

    const completedModules = user.progress.completedModules
      .filter(m => m.status === ProgressStatus.COMPLETED)
      .sort((a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      );

    if (completedModules.length === 0) return false;

    const lastCompleted = completedModules[0];
    return module.prerequisites.includes(lastCompleted.moduleId);
  }

  private completesSkillTree(user: User, module: LearningModule): boolean {
    // Проверяем, закрывает ли модуль важную ветку в skill tree
    // Упрощенная логика
    const userSkills = new Set(user.profile.skills.map(s => s.skillId));
    const moduleSkills = module.skills;

    // Если модуль дает 3+ новых навыка - считаем что это важная ветка
    const newSkills = moduleSkills.filter(s => !userSkills.has(s));
    return newSkills.length >= 3;
  }

  private isDifficultyMatch(
    userLevel: string,
    moduleDifficulty: DifficultyLevel
  ): boolean {
    const difficultyMap = {
      beginner: [DifficultyLevel.EASY],
      intermediate: [DifficultyLevel.EASY, DifficultyLevel.MEDIUM],
      advanced: [DifficultyLevel.MEDIUM, DifficultyLevel.HARD],
      expert: [DifficultyLevel.HARD, DifficultyLevel.EXPERT]
    };

    return difficultyMap[userLevel as keyof typeof difficultyMap]?.includes(
      moduleDifficulty
    ) ?? false;
  }

  private isTooEasy(
    userLevel: string,
    moduleDifficulty: DifficultyLevel
  ): boolean {
    if (userLevel === 'advanced' || userLevel === 'expert') {
      return moduleDifficulty === DifficultyLevel.EASY;
    }
    return false;
  }

  private isTooDifficult(
    userLevel: string,
    moduleDifficulty: DifficultyLevel
  ): boolean {
    if (userLevel === 'beginner') {
      return moduleDifficulty === DifficultyLevel.HARD ||
             moduleDifficulty === DifficultyLevel.EXPERT;
    }
    if (userLevel === 'intermediate') {
      return moduleDifficulty === DifficultyLevel.EXPERT;
    }
    return false;
  }

  private matchContentToStyle(
    learningStyle: LearningStyle,
    contentType: string
  ): number {
    // Упрощенное сопоставление стиля и типа контента
    const styleContentMatch = {
      [LearningStyle.VISUAL]: {
        tutorial: 0.9,
        guide: 0.7,
        workshop: 0.8,
        project: 0.6,
        challenge: 0.5
      },
      [LearningStyle.PRACTICAL]: {
        tutorial: 0.6,
        guide: 0.5,
        workshop: 1.0,
        project: 1.0,
        challenge: 0.9
      },
      [LearningStyle.THEORETICAL]: {
        tutorial: 0.8,
        guide: 1.0,
        workshop: 0.6,
        project: 0.5,
        challenge: 0.7
      },
      [LearningStyle.MIXED]: {
        tutorial: 0.8,
        guide: 0.8,
        workshop: 0.8,
        project: 0.8,
        challenge: 0.8
      }
    };

    return styleContentMatch[learningStyle]?.[contentType as keyof typeof styleContentMatch[typeof learningStyle]] ?? 0.5;
  }
}

// ============================================================================
// Adaptive Learning Path Generator
// ============================================================================

export class LearningPathGenerator {
  private recommendationEngine: RecommendationEngine;

  constructor() {
    this.recommendationEngine = new RecommendationEngine();
  }

  /**
   * Генерирует персонализированный путь обучения
   */
  async generateLearningPath(
    user: User,
    allModules: LearningModule[],
    targetSkills?: string[]
  ): Promise<string[]> {
    const path: string[] = [];
    const completedModuleIds = new Set(
      user.progress.completedModules
        .filter(m => m.status === ProgressStatus.COMPLETED)
        .map(m => m.moduleId)
    );

    // Фильтруем уже завершенные модули
    let availableModules = allModules.filter(
      m => !completedModuleIds.has(m.id)
    );

    // Если указаны целевые навыки - фильтруем по ним
    if (targetSkills && targetSkills.length > 0) {
      availableModules = availableModules.filter(m =>
        m.skills.some(skill => targetSkills.includes(skill))
      );
    }

    // Строим путь итеративно
    const MAX_PATH_LENGTH = 20;
    for (let i = 0; i < MAX_PATH_LENGTH && availableModules.length > 0; i++) {
      const recommendations = await this.recommendationEngine
        .generateRecommendations(user, availableModules, 1);

      if (recommendations.length === 0) break;

      const nextModule = recommendations[0];
      path.push(nextModule.moduleId);

      // Обновляем доступные модули
      availableModules = availableModules.filter(
        m => m.id !== nextModule.moduleId
      );

      // Симулируем завершение модуля для следующей итерации
      // (в реальности это будет обновление user объекта)
    }

    return path;
  }

  /**
   * Оценивает текущий путь пользователя и предлагает корректировки
   */
  async evaluateAndAdjustPath(
    user: User,
    currentPath: string[],
    allModules: LearningModule[]
  ): Promise<{
    shouldAdjust: boolean;
    newPath?: string[];
    reason?: string;
  }> {
    // Анализируем последние сессии
    const recentPerformance = this.analyzeRecentPerformance(user);

    // Если пользователь struggles - упрощаем путь
    if (recentPerformance.struggling) {
      const newPath = await this.generateLearningPath(user, allModules);
      return {
        shouldAdjust: true,
        newPath,
        reason: 'Адаптация под текущую скорость обучения'
      };
    }

    // Если очень быстро прогрессирует - можем ускорить
    if (recentPerformance.excelling) {
      const newPath = await this.generateLearningPath(user, allModules);
      return {
        shouldAdjust: true,
        newPath,
        reason: 'Ускорение благодаря отличному прогрессу'
      };
    }

    return { shouldAdjust: false };
  }

  private analyzeRecentPerformance(user: User): {
    struggling: boolean;
    excelling: boolean;
  } {
    const stats = user.profile.stats;
    return {
      struggling: stats.completionRate < 0.5,
      excelling: stats.completionRate > 0.9
    };
  }
}
