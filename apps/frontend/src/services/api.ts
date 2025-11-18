import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем Telegram auth данные к каждому запросу
apiClient.interceptors.request.use((config) => {
  if (window.Telegram?.WebApp?.initDataUnsafe) {
    const initData = window.Telegram.WebApp.initData;
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - редирект на авторизацию
      console.error('Unauthorized');
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // User
  getUser: () => apiClient.get('/user/me'),
  updateUser: (data: any) => apiClient.patch('/user/me', data),

  // Recommendations
  getRecommendations: (limit?: number) =>
    apiClient.get('/recommendations', { params: { limit } }),

  // Modules
  getModule: (moduleId: string) => apiClient.get(`/modules/${moduleId}`),
  getAllModules: () => apiClient.get('/modules'),

  // Progress
  updateProgress: (moduleId: string, progress: any) =>
    apiClient.post(`/progress/${moduleId}`, progress),
  completeModule: (moduleId: string) =>
    apiClient.post(`/modules/${moduleId}/complete`),

  // Exercises
  submitExercise: (exerciseId: string, data: any) =>
    apiClient.post(`/exercises/${exerciseId}/submit`, data),

  // Quiz
  submitQuiz: (quizId: string, answers: any) =>
    apiClient.post(`/quiz/${quizId}/submit`, answers),

  // Leaderboard
  getLeaderboard: (type: string, period: string) =>
    apiClient.get('/leaderboard', { params: { type, period } }),

  // Analytics
  trackEvent: (event: any) => apiClient.post('/analytics/event', event)
};
