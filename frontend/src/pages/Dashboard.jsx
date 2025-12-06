import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { projectsApi, sessionsApi } from '../lib/api';
import { useLanguage } from '../lib/i18n';
import HelpTooltip from '../components/HelpTooltip';

function Dashboard() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSessions: 0,
    successfulJailbreaks: 0,
    activeSessions: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, sessionsRes] = await Promise.all([
        projectsApi.getAll(),
        sessionsApi.getAll({ limit: 10 })
      ]);

      const projects = projectsRes.data || [];
      const sessions = sessionsRes.data || [];

      setStats({
        totalProjects: projects.length,
        totalSessions: sessions.length,
        successfulJailbreaks: projects.reduce(
          (acc, p) => acc + (typeof p.successfulJailbreaks === 'number' ? p.successfulJailbreaks : 0),
          0
        ),
        activeSessions: sessions.filter(s => s.status === 'RUNNING').length
      });

      const sortedProjects = [...projects].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      setRecentProjects(sortedProjects.slice(0, 5));
      setRecentSessions(sessions.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING': return 'text-accent-blue';
      case 'COMPLETED': return 'text-accent-green';
      case 'FAILED': return 'text-accent-red';
      case 'PAUSED': return 'text-accent-yellow';
      default: return 'text-dark-400';
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'SUCCESS':
        return <span className="px-2 py-1 text-xs bg-accent-green/20 text-accent-green rounded">{t('status.success')}</span>;
      case 'FAILED':
        return <span className="px-2 py-1 text-xs bg-accent-red/20 text-accent-red rounded">{t('status.failed')}</span>;
      case 'DETECTED':
        return <span className="px-2 py-1 text-xs bg-accent-yellow/20 text-accent-yellow rounded">{t('status.detected')}</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-dark-600 text-dark-300 rounded">{t('status.pending')}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const locale = language === 'en' ? 'en-US' : 'tr-TR';
    return new Date(dateString).toLocaleDateString(locale);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-accent-red border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
          <HelpTooltip helpKey="dashboard.help.header" />
        </div>
        <p className="text-dark-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          label={t('dashboard.stats.totalProjects')}
          value={stats.totalProjects}
          color="blue"
        />
        <StatCard
          icon={Activity}
          label={t('dashboard.stats.totalSessions')}
          value={stats.totalSessions}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label={t('dashboard.stats.successfulJailbreaks')}
          value={stats.successfulJailbreaks}
          color="green"
        />
        <StatCard
          icon={Zap}
          label={t('dashboard.stats.activeSessions')}
          value={stats.activeSessions}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">{t('dashboard.recentProjects')}</h2>
              <HelpTooltip helpKey="dashboard.help.recentProjects" />
            </div>
            <Link 
              to="/projects" 
              className="text-sm text-accent-red hover:text-accent-red/80 transition"
            >
              {t('dashboard.allProjects')}
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-10 text-dark-400">
              <Target className="w-10 h-10 mx-auto mb-4 opacity-50" />
              <p>{t('dashboard.noProjectsTitle')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 transition"
                >
                  <div>
                    <p className="text-white font-medium truncate max-w-xs">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-dark-400 truncate max-w-sm">{project.description}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-dark-400">
                    <p>
                      {t('dashboard.projectStatsSummary', {
                        sessions: project.totalSessions ?? 0,
                        success: project.successfulJailbreaks ?? 0
                      })}
                    </p>
                    {project.createdAt && (
                      <p>{formatDate(project.createdAt)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">{t('dashboard.recentSessions')}</h2>
              <HelpTooltip helpKey="dashboard.help.recentSessions" />
            </div>
            <Link 
              to="/projects" 
              className="text-sm text-accent-red hover:text-accent-red/80 transition"
            >
              {t('dashboard.allSessions')}
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-12 text-dark-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('dashboard.noSessionsTitle')}</p>
              <Link 
                to="/projects" 
                className="text-accent-red hover:underline mt-2 inline-block"
              >
                {t('dashboard.noSessionsCta')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="flex items-center justify-between p-4 bg-dark-800 rounded-lg hover:bg-dark-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      session.status === 'RUNNING' ? 'bg-accent-blue animate-pulse' : 'bg-dark-500'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{session.project?.name || t('dashboard.unknownProject')}</p>
                      <p className="text-sm text-dark-400">
                        {session.strategy?.name || t('dashboard.noStrategy')} • {t('dashboard.roundLabel', {
                          current: session.totalRounds,
                          max: session.maxRounds
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getResultBadge(session.result)}
                    <span className={`text-sm ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-accent-blue/20 text-accent-blue',
    green: 'bg-accent-green/20 text-accent-green',
    red: 'bg-accent-red/20 text-accent-red',
    purple: 'bg-accent-purple/20 text-accent-purple',
    yellow: 'bg-accent-yellow/20 text-accent-yellow'
  };

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-dark-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
