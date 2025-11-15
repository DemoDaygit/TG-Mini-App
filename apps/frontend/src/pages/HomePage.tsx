import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Award,
  Book
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { RecommendationCard } from '../components/RecommendationCard';
import { StatsOverview } from '../components/StatsOverview';
import { AchievementBanner } from '../components/AchievementBanner';

const HomePage = () => {
  const { user, recommendations, loadRecommendations } = useUserStore();

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold">
              Привет, {user?.firstName || 'Ученик'}!
            </h1>
            <p className="text-purple-100">
              Продолжай свой путь в мир AI агентов
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {user?.profile.stats.currentStreak || 0}
            </div>
            <div className="text-xs text-purple-100">Дней подряд</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <Target className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {user?.profile.stats.totalModulesCompleted || 0}
            </div>
            <div className="text-xs text-purple-100">Модулей</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {user?.profile.currentXP || 0}
            </div>
            <div className="text-xs text-purple-100">XP</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Achievement */}
      {user?.progress.achievements.length > 0 && (
        <AchievementBanner
          achievement={user.progress.achievements[0]}
        />
      )}

      {/* Personalized Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Рекомендации для тебя
          </h2>
          <Link
            to="/learning-path"
            className="text-indigo-600 text-sm font-medium"
          >
            Смотреть все →
          </Link>
        </div>

        <div className="space-y-3">
          {recommendations?.slice(0, 3).map((rec, index) => (
            <motion.div
              key={rec.moduleId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RecommendationCard recommendation={rec} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Continue Learning */}
      {user?.progress.currentModule && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <Book className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">Продолжить обучение</h3>
              <p className="text-sm text-green-100">
                Ты начал этот модуль
              </p>
            </div>
          </div>

          <Link
            to={`/module/${user.progress.currentModule}`}
            className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Продолжить →
          </Link>
        </motion.div>
      )}

      {/* Learning Stats */}
      <StatsOverview stats={user?.profile.stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/learning-path"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <Target className="w-8 h-8 text-indigo-600 mb-2" />
          <h3 className="font-semibold text-gray-800">Мой путь</h3>
          <p className="text-sm text-gray-500">
            Персональная траектория
          </p>
        </Link>

        <Link
          to="/leaderboard"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <Award className="w-8 h-8 text-amber-500 mb-2" />
          <h3 className="font-semibold text-gray-800">Рейтинг</h3>
          <p className="text-sm text-gray-500">
            Топ учеников
          </p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
