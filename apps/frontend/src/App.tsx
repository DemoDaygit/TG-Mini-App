import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SDKProvider, useLaunchParams } from '@telegram-apps/sdk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import HomePage from './pages/HomePage';
import LearningPathPage from './pages/LearningPathPage';
import ModulePage from './pages/ModulePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

// Components
import { Navigation } from './components/Navigation';
import { ProgressTracker } from './components/ProgressTracker';

const queryClient = new QueryClient();

function App() {
  const launchParams = useLaunchParams();

  useEffect(() => {
    // Инициализация Telegram Mini App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Применяем тему Telegram
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color',
        tg.themeParams.bg_color || '#ffffff'
      );
      document.documentElement.style.setProperty(
        '--tg-theme-text-color',
        tg.themeParams.text_color || '#000000'
      );
    }
  }, []);

  return (
    <SDKProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Progress Tracker - всегда видим */}
            <ProgressTracker />

            {/* Main Content */}
            <main className="pb-20">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learning-path" element={<LearningPathPage />} />
                <Route path="/module/:moduleId" element={<ModulePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Routes>
            </main>

            {/* Bottom Navigation */}
            <Navigation />
          </div>
        </Router>
      </QueryClientProvider>
    </SDKProvider>
  );
}

export default App;
