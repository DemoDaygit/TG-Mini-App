import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp, Award } from 'lucide-react';
import type { UserStats } from '@ai-learning/types';

interface StatsOverviewProps {
  stats?: UserStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  if (!stats) return null;

  const statCards = [
    {
      icon: Target,
      label: 'Модулей завершено',
      value: stats.totalModulesCompleted,
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Clock,
      label: 'Времени обучения',
      value: `${Math.round(stats.totalTimeSpentMinutes / 60)}ч`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Процент завершения',
      value: `${Math.round(stats.completionRate * 100)}%`,
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Award,
      label: 'Средняя сессия',
      value: `${Math.round(stats.averageSessionMinutes)}м`,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {stat.value}
          </div>
          <div className="text-xs text-gray-500">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
