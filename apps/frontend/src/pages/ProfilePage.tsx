import { useUserStore } from '../store/userStore';
import { User, Award, TrendingUp, Settings, LogOut } from 'lucide-react';
import { StatsOverview } from '../components/StatsOverview';

const ProfilePage = () => {
  const { user } = useUserStore();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              {user.username && (
                <div className="text-purple-100">@{user.username}</div>
              )}
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Level badge */}
        <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 inline-block">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold capitalize">
              {user.profile.level} Level
            </span>
            <span className="ml-2 text-sm opacity-80">
              {user.profile.currentXP} XP
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Статистика</h2>
        <StatsOverview stats={user.profile.stats} />
      </section>

      {/* Achievements */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Достижения ({user.progress.achievements.length})
        </h2>
        {user.progress.achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {user.progress.achievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-amber-200"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold text-gray-800 text-sm">
                  {achievement.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  +{achievement.xpReward} XP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Пока нет достижений</p>
            <p className="text-sm">Продолжай учиться, чтобы заработать их!</p>
          </div>
        )}
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          Навыки ({user.profile.skills.length})
        </h2>
        {user.profile.skills.length > 0 ? (
          <div className="space-y-3">
            {user.profile.skills.map((skill) => (
              <div key={skill.skillId} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {skill.skillName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {skill.level}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Начни обучение, чтобы развивать навыки!</p>
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="space-y-2">
        <button className="w-full bg-white rounded-xl p-4 shadow-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="font-medium text-gray-800">Настройки</span>
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full bg-white rounded-xl p-4 shadow-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-red-600">
          <span className="font-medium">Выйти</span>
          <LogOut className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
};

export default ProfilePage;
