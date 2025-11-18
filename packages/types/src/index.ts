/**
 * Core Types для AI Agent Learning Platform
 * Фундаментальные типы данных для обучающей системы
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium: boolean;

  profile: UserProfile;
  progress: UserProgress;

  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  tonAddress?: string; // Адрес TON кошелька
}

export interface UserProfile {
  level: SkillLevel;
  currentXP: number;
  totalXP: number;

  // Профиль навыков
  skills: SkillAssessment[];

  // Стиль обучения
  learningStyle: LearningStyle;

  // Предпочтения
  preferences: UserPreferences;

  // Статистика
  stats: UserStats;
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum LearningStyle {
  VISUAL = 'visual',           // Визуальное обучение
  PRACTICAL = 'practical',     // Практико-ориентированное
  THEORETICAL = 'theoretical', // Теоретическое
  MIXED = 'mixed'             // Смешанное
}

export interface UserPreferences {
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  preferredDifficulty: DifficultyLevel;
  topicsOfInterest: string[];
}

export interface UserStats {
  totalModulesCompleted: number;
  totalTimeSpentMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionMinutes: number;
  completionRate: number;
}

// ============================================================================
// Learning Content Types
// ============================================================================

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;

  // Контент
  content: ModuleContent;

  // Метаданные
  estimatedMinutes: number;
  prerequisites: string[]; // IDs модулей-предшественников
  skills: string[];         // Навыки, которые развивает модуль
  tags: string[];

  // Статистика
  completionCount: number;
  averageRating: number;
  averageCompletionTime: number;

  starsPrice?: number; // Цена в Telegram Stars
  nftContractAddress?: string; // Адрес смарт-контракта NFT

  createdAt: Date;
  updatedAt: Date;
}

export enum ModuleCategory {
  FOUNDATION = 'foundation',
  ARCHITECTURE = 'architecture',
  DEVELOPMENT = 'development',
  ADVANCED = 'advanced',
  PROJECTS = 'projects'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface ModuleContent {
  type: ContentType;
  sections: ContentSection[];
  exercises: Exercise[];
  quiz?: Quiz;
  project?: Project;
}

export enum ContentType {
  TUTORIAL = 'tutorial',
  GUIDE = 'guide',
  WORKSHOP = 'workshop',
  PROJECT = 'project',
  CHALLENGE = 'challenge'
}

export interface ContentSection {
  id: string;
  title: string;
  order: number;

  // Контент может быть разных типов
  blocks: ContentBlock[];
}

export type ContentBlock =
  | TextBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | InteractiveBlock
  | QuizBlock;

export interface TextBlock {
  type: 'text';
  content: string; // Markdown
}

export interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
  explanation?: string;
  runnable?: boolean;
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
}

export interface VideoBlock {
  type: 'video';
  url: string;
  title: string;
  duration?: number;
}

export interface InteractiveBlock {
  type: 'interactive';
  component: string; // Название React компонента
  props: Record<string, any>;
}

export interface QuizBlock {
  type: 'quiz';
  questions: QuizQuestion[];
}

// ============================================================================
// Exercise & Practice Types
// ============================================================================

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;

  instructions: string;
  starterCode?: string;
  solution?: string;
  hints: string[];

  testCases?: TestCase[];
  validation?: ValidationRule[];
}

export enum ExerciseType {
  CODE_COMPLETION = 'code_completion',
  BUILD_AGENT = 'build_agent',
  DEBUG = 'debug',
  ARCHITECTURE_DESIGN = 'architecture_design',
  OPTIMIZATION = 'optimization',
  TESTING = 'testing'
}

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: any;
  description: string;
}

export interface ValidationRule {
  rule: string;
  message: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_SELECT = 'multiple_select',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  CODE = 'code'
}

export interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  rubric: GradingRubric[];
  estimatedHours: number;
}

export interface GradingRubric {
  criterion: string;
  points: number;
  description: string;
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

export interface UserProgress {
  completedModules: ModuleProgress[];
  currentModule?: string;

  skillsAcquired: SkillAssessment[];
  achievements: Achievement[];

  learningPath: LearningPath;
}

export interface ModuleProgress {
  moduleId: string;
  status: ProgressStatus;

  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;

  timeSpentMinutes: number;
  completionPercentage: number;

  sectionsCompleted: string[];
  exercisesCompleted: ExerciseProgress[];
  quizResults?: QuizResult;

  nftTokenId?: string; // ID выданного NFT-сертификата

  notes?: string;
  bookmarked: boolean;
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MASTERED = 'mastered'
}

export interface ExerciseProgress {
  exerciseId: string;
  attempts: number;
  completed: boolean;
  bestScore?: number;
  timeSpentMinutes: number;
  submittedCode?: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  answers: QuizAnswer[];
  completedAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  correct: boolean;
  points: number;
}

export interface SkillAssessment {
  skillId: string;
  skillName: string;
  level: number; // 0-100
  acquiredAt: Date;
  lastPracticedAt: Date;

  // Метрики мастерства
  masteryScore: number;
  practiceCount: number;
  retentionRate: number;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  iconUrl: string;

  earnedAt: Date;
  progress?: number; // Для прогрессивных достижений

  xpReward: number;
}

export enum AchievementType {
  MILESTONE = 'milestone',
  STREAK = 'streak',
  MASTERY = 'mastery',
  SPEED = 'speed',
  COMMUNITY = 'community',
  SPECIAL = 'special'
}

export interface LearningPath {
  recommendedModules: string[];
  completedMilestones: string[];
  currentMilestone?: string;
  estimatedCompletionDate?: Date;
}

// ============================================================================
// Recommendation System Types
// ============================================================================

export interface Recommendation {
  moduleId: string;
  score: number;
  reasons: RecommendationReason[];
  confidence: number;
  estimatedSuccess: number;
  priority: RecommendationPriority;
}

export interface RecommendationReason {
  type: ReasonType;
  description: string;
  weight: number;
}

export enum ReasonType {
  SKILL_GAP = 'skill_gap',
  NEXT_LOGICAL_STEP = 'next_logical_step',
  PEER_SUCCESS = 'peer_success',
  TRENDING = 'trending',
  COMPLETES_SKILL_TREE = 'completes_skill_tree',
  MATCHES_LEARNING_STYLE = 'matches_learning_style',
  TIME_OPTIMIZED = 'time_optimized'
}

export enum RecommendationPriority {
  CRITICAL = 'critical',   // Необходимо для прогресса
  HIGH = 'high',           // Сильно рекомендуется
  MEDIUM = 'medium',       // Рекомендуется
  LOW = 'low',            // Опционально
  OPTIONAL = 'optional'    // Дополнительно
}

// ============================================================================
// Analytics & Metrics Types
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: EventType;
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

export enum EventType {
  MODULE_STARTED = 'module_started',
  MODULE_COMPLETED = 'module_completed',
  EXERCISE_ATTEMPTED = 'exercise_attempted',
  EXERCISE_COMPLETED = 'exercise_completed',
  QUIZ_TAKEN = 'quiz_taken',
  VIDEO_WATCHED = 'video_watched',
  CODE_RUN = 'code_run',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended'
}

export interface UserMetrics {
  userId: string;
  period: MetricsPeriod;

  engagement: EngagementMetrics;
  learning: LearningMetrics;
  performance: PerformanceMetrics;
}

export enum MetricsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time'
}

export interface EngagementMetrics {
  sessionsCount: number;
  totalTimeMinutes: number;
  averageSessionMinutes: number;
  daysActive: number;
  currentStreak: number;
}

export interface LearningMetrics {
  modulesStarted: number;
  modulesCompleted: number;
  completionRate: number;
  averageModuleTime: number;
  skillsAcquired: number;
  xpEarned: number;
}

export interface PerformanceMetrics {
  averageQuizScore: number;
  exercisesCompleted: number;
  exerciseSuccessRate: number;
  averageAttempts: number;
  projectsCompleted: number;
}

// ============================================================================
// AI Agent Architecture Education Types
// ============================================================================

export interface AgentArchitectureConcept {
  id: string;
  name: string;
  category: AgentConceptCategory;
  description: string;

  // Визуализация
  diagram?: string;
  codeExamples: CodeExample[];

  // Связи
  relatedConcepts: string[];
  prerequisites: string[];

  // Практика
  practicalExercises: Exercise[];
  realWorldExamples: RealWorldExample[];
}

export enum AgentConceptCategory {
  PERCEPTION = 'perception',
  REASONING = 'reasoning',
  PLANNING = 'planning',
  ACTION = 'action',
  MEMORY = 'memory',
  LEARNING = 'learning',
  COMMUNICATION = 'communication',
  ORCHESTRATION = 'orchestration'
}

export interface CodeExample {
  title: string;
  language: string;
  code: string;
  explanation: string;
  framework?: AIFramework;
}

export enum AIFramework {
  LANGCHAIN = 'langchain',
  LANGGRAPH = 'langgraph',
  AUTOGEN = 'autogen',
  CREWAI = 'crewai',
  SEMANTIC_KERNEL = 'semantic_kernel',
  HAYSTACK = 'haystack',
  CUSTOM = 'custom'
}

export interface RealWorldExample {
  title: string;
  domain: string;
  description: string;
  implementation: string;
  outcomes: string;
  challenges: string;
}

// ============================================================================
// Community & Social Types
// ============================================================================

export interface Community {
  discussions: Discussion[];
  sharedAgents: SharedAgent[];
  leaderboards: Leaderboard[];
}

export interface Discussion {
  id: string;
  authorId: string;
  moduleId?: string;
  title: string;
  content: string;
  tags: string[];
  replies: Reply[];
  upvotes: number;
  createdAt: Date;
}

export interface Reply {
  id: string;
  authorId: string;
  content: string;
  upvotes: number;
  createdAt: Date;
}

export interface SharedAgent {
  id: string;
  authorId: string;
  name: string;
  description: string;
  category: string;
  code: string;
  framework: AIFramework;
  upvotes: number;
  downloads: number;
  createdAt: Date;
}

export interface Leaderboard {
  id: string;
  type: LeaderboardType;
  period: MetricsPeriod;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export enum LeaderboardType {
  XP = 'xp',
  MODULES_COMPLETED = 'modules_completed',
  STREAK = 'streak',
  COMMUNITY_CONTRIBUTION = 'community_contribution'
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  change: number; // Изменение позиции
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  processingTimeMs: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
