import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';

export const ProgressTracker = () => {
  const user = useUserStore((state) => state.user);

  if (!user) return null;

  const level = user.profile.level;
  const currentXP = user.profile.currentXP;
  const totalXP = user.profile.totalXP;

  // Вычисляем прогресс до следующего уровня
  const levelThresholds = {
    beginner: 0,
    intermediate: 1000,
    advanced: 5000,
    expert: 15000
  };

  const nextLevel = {
    beginner: { name: 'Intermediate', xp: 1000 },
    intermediate: { name: 'Advanced', xp: 5000 },
    advanced: { name: 'Expert', xp: 15000 },
    expert: { name: 'Master', xp: 50000 }
  }[level];

  const progressToNextLevel = nextLevel
    ? ((currentXP - levelThresholds[level as keyof typeof levelThresholds]) /
        (nextLevel.xp - levelThresholds[level as keyof typeof levelThresholds])) *
      100
    : 100;

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {user.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-semibold text-gray-800 capitalize">
                {level}
              </div>
              <div className="text-xs text-gray-500">
                {currentXP} / {nextLevel?.xp || currentXP} XP
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                {user.profile.stats.currentStreak} 🔥
              </div>
              <div className="text-xs text-gray-500">дней подряд</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {nextLevel && (
          <div className="text-xs text-gray-500 mt-1 text-center">
            {Math.round(progressToNextLevel)}% до уровня {nextLevel.name}
          </div>
        )}
      </div>
    </div>
  );
};
