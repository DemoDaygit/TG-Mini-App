import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';
import type { Achievement } from '@ai-learning/types';

interface AchievementBannerProps {
  achievement: Achievement;
}

export const AchievementBanner = ({ achievement }: AchievementBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white relative overflow-hidden"
    >
      {/* Background sparkles */}
      <div className="absolute inset-0 opacity-20">
        <Sparkles className="absolute top-2 right-4 w-6 h-6 animate-pulse" />
        <Sparkles className="absolute bottom-4 left-8 w-4 h-4 animate-pulse delay-100" />
        <Sparkles className="absolute top-1/2 right-12 w-5 h-5 animate-pulse delay-200" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium opacity-90">
            Новое достижение!
          </div>
          <div className="font-bold text-lg">
            {achievement.name}
          </div>
          <div className="text-sm opacity-80">
            {achievement.description}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            +{achievement.xpReward}
          </div>
          <div className="text-xs opacity-80">XP</div>
        </div>
      </div>
    </motion.div>
  );
};
