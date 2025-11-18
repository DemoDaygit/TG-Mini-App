import { useState } from 'react';
import { Trophy, TrendingUp, Flame, Award } from 'lucide-react';
import { motion } from 'framer-motion';

type LeaderboardType = 'xp' | 'modules' | 'streak';

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('xp');

  // Mock data - будет заменено на реальные данные из API
  const mockLeaders = [
    { rank: 1, username: 'AlexDev', score: 15420, avatar: 'A' },
    { rank: 2, username: 'SarahAI', score: 14890, avatar: 'S' },
    { rank: 3, username: 'MikeML', score: 13250, avatar: 'M' },
    { rank: 4, username: 'EmmaCode', score: 12100, avatar: 'E' },
    { rank: 5, username: 'DanBot', score: 11500, avatar: 'D' },
    { rank: 6, username: 'OliviaTech', score: 10800, avatar: 'O' },
    { rank: 7, username: 'JakePy', score: 9950, avatar: 'J' },
    { rank: 8, username: 'SophiaJS', score: 9200, avatar: 'S' },
  ];

  const tabs = [
    { id: 'xp' as LeaderboardType, label: 'XP', icon: TrendingUp },
    { id: 'modules' as LeaderboardType, label: 'Модули', icon: Award },
    { id: 'streak' as LeaderboardType, label: 'Серии', icon: Flame }
  ];

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-600 to-amber-800';
      default:
        return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Рейтинг</h1>
        </div>
        <p className="text-amber-100">
          Соревнуйся с лучшими учениками платформы
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 flex gap-2 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-2">
          {mockLeaders.map((leader, index) => (
            <motion.div
              key={leader.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 ${
                leader.rank <= 3 ? 'border-2 border-amber-200' : ''
              }`}
            >
              {/* Rank */}
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(
                  leader.rank
                )} flex items-center justify-center text-white font-bold text-lg`}
              >
                {leader.rank <= 3 ? (
                  <Trophy className="w-6 h-6" />
                ) : (
                  leader.rank
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {leader.avatar}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {leader.username}
                </div>
                <div className="text-sm text-gray-500">
                  {leader.rank === 1 && '👑 Лидер'}
                  {leader.rank === 2 && '🥈 Второе место'}
                  {leader.rank === 3 && '🥉 Третье место'}
                  {leader.rank > 3 && `#${leader.rank}`}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">
                  {leader.score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {activeTab === 'xp' && 'XP'}
                  {activeTab === 'modules' && 'модулей'}
                  {activeTab === 'streak' && 'дней'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Your position */}
        <div className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
          <div className="text-sm opacity-90 mb-1">Твоя позиция</div>
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg">#42</div>
            <div className="text-right">
              <div className="text-xl font-bold">5,240 XP</div>
              <div className="text-sm opacity-80">
                До топ-10: 4,760 XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
