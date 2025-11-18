import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Recommendation,
  LearningModule
} from '@ai-learning/types';
import { apiClient } from '../services/api';

interface UserState {
  user: User | null;
  recommendations: Recommendation[];
  currentModule: LearningModule | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUser: () => Promise<void>;
  loadRecommendations: () => Promise<void>;
  loadModule: (moduleId: string) => Promise<void>;
  updateProgress: (moduleId: string, progress: any) => Promise<void>;
  completeModule: (moduleId: string) => Promise<void>;
  completeExercise: (exerciseId: string, data: any) => Promise<void>;
  submitQuiz: (quizId: string, answers: any) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      recommendations: [],
      currentModule: null,
      isLoading: false,
      error: null,

      loadUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/user/me');
          set({ user: response.data, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Ошибка загрузки пользователя',
            isLoading: false
          });
        }
      },

      loadRecommendations: async () => {
        try {
          const response = await apiClient.get('/recommendations');
          set({ recommendations: response.data });
        } catch (error: any) {
          console.error('Ошибка загрузки рекомендаций:', error);
        }
      },

      loadModule: async (moduleId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get(`/modules/${moduleId}`);
          set({ currentModule: response.data, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Ошибка загрузки модуля',
            isLoading: false
          });
        }
      },

      updateProgress: async (moduleId: string, progress: any) => {
        try {
          await apiClient.post(`/progress/${moduleId}`, progress);

          // Обновляем локальное состояние
          const { user } = get();
          if (user) {
            const updatedProgress = user.progress.completedModules.map(m =>
              m.moduleId === moduleId ? { ...m, ...progress } : m
            );
            set({
              user: {
                ...user,
                progress: {
                  ...user.progress,
                  completedModules: updatedProgress
                }
              }
            });
          }
        } catch (error: any) {
          console.error('Ошибка обновления прогресса:', error);
        }
      },

      completeModule: async (moduleId: string) => {
        try {
          const response = await apiClient.post(`/modules/${moduleId}/complete`);

          // Обновляем пользователя
          const { user } = get();
          if (user) {
            set({
              user: {
                ...user,
                profile: {
                  ...user.profile,
                  currentXP: user.profile.currentXP + response.data.xpEarned,
                  stats: {
                    ...user.profile.stats,
                    totalModulesCompleted: user.profile.stats.totalModulesCompleted + 1
                  }
                }
              }
            });
          }

          // Перезагружаем рекомендации
          await get().loadRecommendations();
        } catch (error: any) {
          console.error('Ошибка завершения модуля:', error);
        }
      },

      completeExercise: async (exerciseId: string, data: any) => {
        try {
          const response = await apiClient.post(
            `/exercises/${exerciseId}/submit`,
            data
          );
          return response.data;
        } catch (error: any) {
          console.error('Ошибка отправки упражнения:', error);
          throw error;
        }
      },

      submitQuiz: async (quizId: string, answers: any) => {
        try {
          const response = await apiClient.post(`/quiz/${quizId}/submit`, answers);
          return response.data;
        } catch (error: any) {
          console.error('Ошибка отправки quiz:', error);
          throw error;
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user
      })
    }
  )
);
