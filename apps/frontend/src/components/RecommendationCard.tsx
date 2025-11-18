import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Target, Zap } from 'lucide-react';
import type { Recommendation } from '@ai-learning/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
}

export const RecommendationCard = ({ recommendation, index = 0 }: RecommendationCardProps) => {
  // Определяем цвет на основе приоритета
  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-amber-600';
      case 'medium':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityLabel = () => {
    switch (recommendation.priority) {
      case 'critical':
        return 'Критически важно';
      case 'high':
        return 'Рекомендуется';
      case 'medium':
        return 'Полезно';
      default:
        return 'Дополнительно';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <Link to={`/module/${recommendation.moduleId}`}>
        {/* Priority Indicator */}
        <div className={`h-2 bg-gradient-to-r ${getPriorityColor()}`} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${getPriorityColor()} text-white`}>
                  {getPriorityLabel()}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(recommendation.score * 100)}% match
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">
                {recommendation.moduleId}
              </h3>
            </div>
          </div>

          {/* Reasons */}
          <div className="space-y-2 mb-4">
            {recommendation.reasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="mt-1">
                  {reason.type === 'next_logical_step' && (
                    <Target className="w-4 h-4 text-indigo-500" />
                  )}
                  {reason.type === 'skill_gap' && (
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  )}
                  {reason.type === 'matches_learning_style' && (
                    <Zap className="w-4 h-4 text-purple-500" />
                  )}
                  {!['next_logical_step', 'skill_gap', 'matches_learning_style'].includes(reason.type) && (
                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                  )}
                </div>
                <span className="text-gray-600">{reason.description}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>30 мин</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">
                  Успешность: {Math.round(recommendation.estimatedSuccess * 100)}%
                </span>
              </div>
            </div>
            <span className="text-indigo-600 font-medium">
              Начать →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
