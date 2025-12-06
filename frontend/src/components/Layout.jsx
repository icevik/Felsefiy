import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Swords, 
  Settings,
  Shield
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

function Layout() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/projects', icon: FolderKanban, label: t('nav.projects') },
    { to: '/strategies', icon: Swords, label: t('nav.strategies') },
  ];

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-red/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-red" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('common.appName')}</h1>
              <p className="text-xs text-dark-400">{t('common.appSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-accent-red/20 text-accent-red'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-700 space-y-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-xs rounded-lg border border-dark-600 text-dark-300 hover:bg-dark-800 hover:text-white transition"
          >
            {t('common.logout')}
          </button>
          <div className="text-xs text-dark-500 text-center">
            v1.0.0 • {t('common.versionLabel')}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
