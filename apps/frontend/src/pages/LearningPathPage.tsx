import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Target, Lock, CheckCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { RecommendationCard } from '../components/RecommendationCard';

const LearningPathPage = () => {
  const { user, recommendations, loadRecommendations } = useUserStore();

  useEffect(() => {
    loadRecommendations();
  }, []);

  // Group recommendations by priority
  const critical = recommendations.filter(r => r.priority === 'critical');
  const high = recommendations.filter(r => r.priority === 'high');
  const medium = recommendations.filter(r => r.priority === 'medium');
  const optional = recommendations.filter(r => r.priority === 'low' || r.priority === 'optional');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Map className="w-8 h-8" />
          <h1 className="text-2xl font-bold">
            Твой путь обучения
          </h1>
        </div>
        <p className="text-indigo-100">
          Персонализированная траектория на основе твоих навыков и целей
        </p>

        {/* Progress overview */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <Target className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {user?.profile.stats.totalModulesCompleted || 0}
            </div>
            <div className="text-xs text-indigo-100">Завершено</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {critical.length + high.length}
            </div>
            <div className="text-xs text-indigo-100">Рекомендовано</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <Lock className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {optional.length}
            </div>
            <div className="text-xs text-indigo-100">Доступно</div>
          </div>
        </div>
      </div>

      {/* Critical priority */}
      {critical.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Критически важно
          </h2>
          <div className="space-y-3">
            {critical.map((rec, index) => (
              <RecommendationCard key={rec.moduleId} recommendation={rec} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* High priority */}
      {high.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Сильно рекомендуется
          </h2>
          <div className="space-y-3">
            {high.map((rec, index) => (
              <RecommendationCard key={rec.moduleId} recommendation={rec} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Medium priority */}
      {medium.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Рекомендуется
          </h2>
          <div className="space-y-3">
            {medium.map((rec, index) => (
              <RecommendationCard key={rec.moduleId} recommendation={rec} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Optional */}
      {optional.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Дополнительно
          </h2>
          <div className="space-y-3">
            {optional.map((rec, index) => (
              <RecommendationCard key={rec.moduleId} recommendation={rec} index={index} />
            ))}
          </div>
        </section>
      )}

      {recommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Загружаем твой персональный путь...</p>
        </motion.div>
      )}
    </div>
  );
};

export default LearningPathPage;
