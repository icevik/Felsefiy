import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Target, 
  MoreVertical, 
  Trash2, 
  Edit,
  Play,
  ExternalLink
} from 'lucide-react';
import { projectsApi } from '../lib/api';
import ProjectForm from '../components/ProjectForm';
import { useLanguage } from '../lib/i18n';
import HelpTooltip from '../components/HelpTooltip';

function Projects() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('projects.deleteConfirm'))) return;
    
    try {
      await projectsApi.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, data);
      } else {
        await projectsApi.create(data);
      }
      setShowForm(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert(t('projects.errors.saveFailedPrefix') + (error.response?.data?.error || error.message));
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{t('projects.title')}</h1>
            <HelpTooltip helpKey="projects.help.header" />
          </div>
          <p className="text-dark-400">{t('projects.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition shadow-lg shadow-accent-red/20"
        >
          <Plus className="w-5 h-5" />
          {t('projects.newProject')}
          <HelpTooltip helpKey="projects.help.newProjectButton" />
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-dark-900 rounded-xl border border-dark-700">
          <Target className="w-16 h-16 mx-auto mb-4 text-dark-500" />
          <h3 className="text-xl font-semibold text-white mb-2">{t('projects.emptyTitle')}</h3>
          <p className="text-dark-400 mb-6">{t('projects.emptyBody')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition"
          >
            {t('projects.emptyCta')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => { setEditingProject(project); setShowForm(true); }}
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useLanguage();
  const successRate = project.totalSessions > 0 
    ? Math.round((project.successfulJailbreaks / project.totalSessions) * 100) 
    : 0;

  return (
    <div className="bg-gradient-to-b from-dark-900 to-dark-950 rounded-xl border border-dark-700 p-6 hover:border-accent-red/40 hover:shadow-xl hover:shadow-accent-red/10 transition-all duration-200 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-accent-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-accent-red" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white mb-1 truncate">{project.name}</h3>
            {project.targetUrl && (
              <div className="flex items-center gap-2 text-[11px] text-dark-400">
                <span className="px-2 py-0.5 rounded-full bg-dark-800 text-dark-300 border border-dark-600 font-mono uppercase text-[10px] flex-shrink-0">
                  {project.method || 'POST'}
                </span>
                <p className="truncate font-mono">
                  {project.targetUrl.replace(/^https?:\/\//, '')}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-dark-700 rounded-lg transition"
          >
            <MoreVertical className="w-4 h-4 text-dark-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-10 min-w-[140px]">
              <button
                onClick={() => { setShowMenu(false); onEdit(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition"
              >
                <Edit className="w-4 h-4" />
                {t('projects.edit')}
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-accent-red hover:bg-dark-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                {t('projects.delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-dark-300 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 py-4 border-y border-dark-700">
        <div className="text-center">
          <p className="text-lg font-semibold text-white">{project.totalSessions}</p>
          <p className="text-xs text-dark-400">{t('projects.sessionsLabel')}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-accent-green">{project.successfulJailbreaks}</p>
          <p className="text-xs text-dark-400">{t('projects.successLabel')}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-accent-yellow">{successRate}%</p>
          <p className="text-xs text-dark-400">{t('projects.rateLabel')}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition text-sm"
        >
          <Play className="w-4 h-4" />
          {t('projects.startTest')}
          <HelpTooltip helpKey="projects.help.startTestButton" />
        </Link>
        <Link
          to={`/projects/${project.id}`}
          className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default Projects;
