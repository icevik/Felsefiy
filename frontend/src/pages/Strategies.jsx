import { useEffect, useState } from 'react';
import { 
  Plus, 
  Swords, 
  MoreVertical, 
  Trash2, 
  Edit,
  RefreshCw,
  Tag
} from 'lucide-react';
import { strategiesApi } from '../lib/api';
import { useLanguage } from '../lib/i18n';
import HelpTooltip from '../components/HelpTooltip';

function Strategies() {
  const { t } = useLanguage();
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      const res = await strategiesApi.getAll();
      setStrategies(res.data);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await strategiesApi.seed();
      loadStrategies();
    } catch (error) {
      console.error('Failed to seed strategies:', error);
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('strategies.deleteConfirm'))) return;
    
    try {
      await strategiesApi.delete(id);
      setStrategies(strategies.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete strategy:', error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingStrategy) {
        await strategiesApi.update(editingStrategy.id, data);
      } else {
        await strategiesApi.create(data);
      }
      setShowForm(false);
      setEditingStrategy(null);
      loadStrategies();
    } catch (error) {
      console.error('Failed to save strategy:', error);
      alert(t('strategies.errors.saveFailedPrefix') + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dark-400">{t('strategies.loading')}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{t('strategies.title')}</h1>
            <HelpTooltip helpKey="strategies.help.header" />
          </div>
          <p className="text-dark-400">{t('strategies.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${seeding ? 'animate-spin' : ''}`} />
            {t('strategies.seedButton')}
            <HelpTooltip helpKey="strategies.help.seedButton" />
          </button>
          <button
            onClick={() => { setEditingStrategy(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            {t('strategies.newStrategy')}
            <HelpTooltip helpKey="strategies.help.newStrategyButton" />
          </button>
        </div>
      </div>

      {/* Strategies Grid */}
      {strategies.length === 0 ? (
        <div className="text-center py-16 bg-dark-900 rounded-xl border border-dark-700">
          <Swords className="w-16 h-16 mx-auto mb-4 text-dark-500" />
          <h3 className="text-xl font-semibold text-white mb-2">{t('strategies.emptyTitle')}</h3>
          <p className="text-dark-400 mb-6">{t('strategies.emptyBody')}</p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-3 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition disabled:opacity-50"
          >
            {seeding ? t('strategies.loading') : t('strategies.emptySeedCta')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEdit={() => { setEditingStrategy(strategy); setShowForm(true); }}
              onDelete={() => handleDelete(strategy.id)}
            />
          ))}
        </div>
      )}

      {/* Strategy Form Modal */}
      {showForm && (
        <StrategyForm
          strategy={editingStrategy}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingStrategy(null); }}
        />
      )}
    </div>
  );
}

function StrategyCard({ strategy, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 hover:border-dark-600 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
            <Swords className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{strategy.name}</h3>
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
                {t('strategies.edit')}
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-accent-red hover:bg-dark-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                {t('strategies.delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {strategy.description && (
        <p className="text-sm text-dark-400 mb-4 line-clamp-2">{strategy.description}</p>
      )}

      {/* Tags */}
      {strategy.tags && strategy.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {strategy.tags.map((tag, index) => (
            <span 
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 text-dark-300 rounded text-xs"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Initial Prompt Preview */}
      <div className="p-3 bg-dark-800 rounded-lg">
        <p className="text-xs text-dark-400 mb-1">{t('strategies.initialPromptLabel')}</p>
        <p className="text-sm text-dark-200 line-clamp-2 terminal-text">
          {strategy.initialPrompt}
        </p>
      </div>
    </div>
  );
}

function StrategyForm({ strategy, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attackerSystemPrompt: '',
    initialPrompt: '',
    tags: ''
  });

  const { t } = useLanguage();

  useEffect(() => {
    if (strategy) {
      setFormData({
        name: strategy.name || '',
        description: strategy.description || '',
        attackerSystemPrompt: strategy.attackerSystemPrompt || '',
        initialPrompt: strategy.initialPrompt || '',
        tags: strategy.tags?.join(', ') || ''
      });
    }
  }, [strategy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.attackerSystemPrompt || !formData.initialPrompt) {
      alert(t('strategies.formValidation'));
      return;
    }

    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-xl border border-dark-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-white">
            {strategy ? t('strategies.formEditTitle') : t('strategies.formCreateTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition text-dark-400"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-dark-300 mb-2">{t('strategies.formNameLabel')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red"
              placeholder={t('strategies.formNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">{t('strategies.formDescriptionLabel')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none"
              placeholder={t('strategies.formDescriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">{t('strategies.formSystemPromptLabel')}</label>
            <textarea
              name="attackerSystemPrompt"
              value={formData.attackerSystemPrompt}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none terminal-text text-sm"
              placeholder={t('strategies.formSystemPromptPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">{t('strategies.formInitialPromptLabel')}</label>
            <textarea
              name="initialPrompt"
              value={formData.initialPrompt}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none terminal-text text-sm"
              placeholder={t('strategies.formInitialPromptPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">{t('strategies.formTagsLabel')}</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red"
              placeholder={t('strategies.formTagsPlaceholder')}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
            >
              {t('strategies.formCancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition"
            >
              {strategy ? t('strategies.formUpdate') : t('strategies.formCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Strategies;
