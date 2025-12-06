import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, XCircle } from 'lucide-react';
import { projectsApi } from '../lib/api';
import { useLanguage } from '../lib/i18n';

// Popüler model önerileri (datalist için)
const suggestedModels = [
  'google/gemini-2.5-flash',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'openai/gpt-4-turbo',
  'openai/gpt-4o',
  'openai/gpt-3.5-turbo',
  'google/gemini-pro',
  'google/gemini-1.5-pro',
  'meta-llama/llama-3-70b-instruct',
  'mistralai/mistral-7b-instruct',
  'mistralai/mixtral-8x7b-instruct'
];

function ProjectForm({ project, onSubmit, onClose }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUrl: '',
    method: 'POST',
    headers: '{}',
    bodyTemplate: '{"prompt": "{{prompt}}"}',
    attackerModel: 'anthropic/claude-3-haiku',
    moderatorModel: 'anthropic/claude-3-haiku'
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        targetUrl: project.targetUrl || '',
        method: project.method || 'POST',
        headers: typeof project.headers === 'object' 
          ? JSON.stringify(project.headers, null, 2) 
          : project.headers || '{}',
        bodyTemplate: project.bodyTemplate || '{"prompt": "{{prompt}}"}',
        attackerModel: project.attackerModel || 'anthropic/claude-3-haiku',
        moderatorModel: project.moderatorModel || 'anthropic/claude-3-haiku'
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('projectForm.errors.nameRequired');
    }
    
    if (!formData.targetUrl.trim()) {
      newErrors.targetUrl = t('projectForm.errors.urlRequired');
    } else {
      try {
        new URL(formData.targetUrl);
      } catch {
        newErrors.targetUrl = t('projectForm.errors.urlInvalid');
      }
    }

    try {
      JSON.parse(formData.headers);
    } catch {
      newErrors.headers = t('projectForm.errors.headersInvalid');
    }

    if (!formData.bodyTemplate.includes('{{prompt}}')) {
      newErrors.bodyTemplate = t('projectForm.errors.bodyMissingPrompt');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        headers: JSON.parse(formData.headers)
      });
    }
  };

  const handleTest = async () => {
    if (!formData.targetUrl) {
      setErrors({ targetUrl: t('projectForm.errors.testUrlRequired') });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Create temporary project for testing
      const tempProject = await projectsApi.create({
        name: 'Test Project',
        targetUrl: formData.targetUrl,
        method: formData.method,
        headers: JSON.parse(formData.headers),
        bodyTemplate: formData.bodyTemplate
      });

      const result = await projectsApi.test(tempProject.data.id, 'Merhaba, bu bir test mesajıdır.');
      
      // Delete temp project
      await projectsApi.delete(tempProject.data.id);

      setTestResult({
        success: result.data.success,
        content: result.data.content?.substring(0, 500) || 'Yanıt alındı'
      });
    } catch (error) {
      setTestResult({
        success: false,
        content: error.response?.data?.message || error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-xl border border-dark-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-white">
            {project ? t('projectForm.editTitle') : t('projectForm.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wide">{t('projectForm.basicInfo')}</h3>
            
            <div>
              <label className="block text-sm text-dark-300 mb-2">{t('projectForm.nameLabel')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red ${
                  errors.name ? 'border-accent-red' : 'border-dark-600'
                }`}
                placeholder={t('projectForm.namePlaceholder')}
              />
              {errors.name && <p className="text-sm text-accent-red mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">{t('projectForm.descriptionLabel')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none"
                placeholder={t('projectForm.descriptionPlaceholder')}
              />
            </div>
          </div>

          {/* Target Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wide">{t('projectForm.targetConfig')}</h3>
            
            <div className="flex gap-4">
              <div className="w-32">
                <label className="block text-sm text-dark-300 mb-2">{t('projectForm.methodLabel')}</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-accent-red"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-dark-300 mb-2">{t('projectForm.urlLabel')}</label>
                <input
                  type="text"
                  name="targetUrl"
                  value={formData.targetUrl}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red ${
                    errors.targetUrl ? 'border-accent-red' : 'border-dark-600'
                  }`}
                  placeholder={t('projectForm.urlPlaceholder')}
                />
                {errors.targetUrl && <p className="text-sm text-accent-red mt-1">{errors.targetUrl}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">{t('projectForm.headersLabel')}</label>
              <textarea
                name="headers"
                value={formData.headers}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white font-mono text-sm placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none ${
                  errors.headers ? 'border-accent-red' : 'border-dark-600'
                }`}
                placeholder={t('projectForm.headersPlaceholder')}
              />
              {errors.headers && <p className="text-sm text-accent-red mt-1">{errors.headers}</p>}
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">
                {t('projectForm.bodyLabel', { prompt: '{{prompt}}' })}
              </label>
              <textarea
                name="bodyTemplate"
                value={formData.bodyTemplate}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-3 bg-dark-800 border rounded-lg text-white font-mono text-sm placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none ${
                  errors.bodyTemplate ? 'border-accent-red' : 'border-dark-600'
                }`}
                placeholder={t('projectForm.bodyPlaceholder')}
              />
              {errors.bodyTemplate && <p className="text-sm text-accent-red mt-1">{errors.bodyTemplate}</p>}
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {testing ? t('projectForm.testing') : t('projectForm.testButton')}
              </button>
              
              {testResult && (
                <div className={`flex items-center gap-2 ${testResult.success ? 'text-accent-green' : 'text-accent-red'}`}>
                  {testResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="text-sm">{testResult.success ? t('projectForm.testSuccess') : t('projectForm.testFail')}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Models */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wide">{t('projectForm.aiModels')}</h3>
            
            <p className="text-xs text-dark-400 mb-3">
              {t('projectForm.modelsHint')} <code className="text-accent-red">google/gemini-2.5-flash</code>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">{t('projectForm.attackerModel')}</label>
                <input
                  type="text"
                  name="attackerModel"
                  value={formData.attackerModel}
                  onChange={handleChange}
                  list="attacker-models"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red font-mono text-sm"
                  placeholder="google/gemini-2.5-flash"
                />
                <datalist id="attacker-models">
                  {suggestedModels.map(model => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm text-dark-300 mb-2">{t('projectForm.moderatorModel')}</label>
                <input
                  type="text"
                  name="moderatorModel"
                  value={formData.moderatorModel}
                  onChange={handleChange}
                  list="moderator-models"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red font-mono text-sm"
                  placeholder="google/gemini-2.5-flash"
                />
                <datalist id="moderator-models">
                  {suggestedModels.map(model => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
            >
              {t('projectForm.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition"
            >
              {project ? t('projectForm.update') : t('projectForm.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;
