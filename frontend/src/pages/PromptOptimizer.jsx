import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  Layers,
  Shield,
  Eye,
  Trash2,
  RefreshCw,
  ArrowLeft,
  FileText,
  Lightbulb
} from 'lucide-react';
import { optimizerApi, projectsApi } from '../lib/api';
import { useLanguage } from '../lib/i18n';
import HelpTooltip from '../components/HelpTooltip';

const OPTIMIZATION_TYPES = [
  { value: 'ENHANCE', icon: Zap, color: 'yellow' },
  { value: 'COMBINE', icon: Layers, color: 'blue' },
  { value: 'ADAPT', icon: Target, color: 'green' },
  { value: 'SIMPLIFY', icon: FileText, color: 'orange' },
  { value: 'OBFUSCATE', icon: Shield, color: 'purple' }
];

export default function PromptOptimizer() {
  const { projectId } = useParams();
  const { t, language } = useLanguage();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState('optimize');
  
  // Optimize tab state
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizationType, setOptimizationType] = useState('ENHANCE');
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Analysis tab state
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Data
  const [successfulAttacks, setSuccessfulAttacks] = useState([]);
  const [optimizedPrompts, setOptimizedPrompts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [expandedAttack, setExpandedAttack] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, attacksRes, optimizedRes, templatesRes] = await Promise.all([
        projectsApi.getOne(projectId),
        optimizerApi.getAttacks(projectId),
        optimizerApi.getOptimized(projectId),
        optimizerApi.getTemplates()
      ]);
      
      setProject(projectRes.data);
      setSuccessfulAttacks(attacksRes.data);
      setOptimizedPrompts(optimizedRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) return;
    
    try {
      setOptimizing(true);
      const response = await optimizerApi.optimize({
        projectId,
        prompt: originalPrompt,
        optimizationType
      });
      setOptimizedResult(response.data);
    } catch (error) {
      console.error('Optimize error:', error);
      alert(t('optimizer.errors.optimizeFailed') + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleCombine = async () => {
    if (successfulAttacks.length < 2) {
      alert(t('optimizer.combineTooltip'));
      return;
    }
    
    try {
      setOptimizing(true);
      const response = await optimizerApi.combine(projectId);
      setOptimizedResult(response.data);
    } catch (error) {
      console.error('Combine error:', error);
      alert(t('optimizer.errors.combineFailed') + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisPrompt.trim()) return;
    
    try {
      setAnalyzing(true);
      const response = await optimizerApi.analyze(analysisPrompt);
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('Analyze error:', error);
      alert(t('optimizer.errors.analyzeFailed') + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useAsOriginal = (prompt) => {
    setOriginalPrompt(prompt);
    setActiveTab('optimize');
  };

  const seedTemplates = async () => {
    try {
      await optimizerApi.seedTemplates();
      const templatesRes = await optimizerApi.getTemplates();
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Seed templates error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('optimizer.backToProject')}
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{t('optimizer.title')}</h1>
              <HelpTooltip helpKey="optimizer.help.header" />
            </div>
            <p className="text-gray-400">{t('optimizer.subtitle', { project: project?.name || '' })}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{successfulAttacks.length}</p>
              <p className="text-sm text-gray-400">{t('optimizer.stats.successfulAttacks')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{optimizedPrompts.length}</p>
              <p className="text-sm text-gray-400">{t('optimizer.stats.optimized')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{templates.length}</p>
              <p className="text-sm text-gray-400">{t('optimizer.stats.templates')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {optimizedPrompts.length > 0 
                  ? Math.round(optimizedPrompts.reduce((a, b) => a + (b.successRate || 0), 0) / optimizedPrompts.length * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-gray-400">{t('optimizer.stats.avgSuccess')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        {[
          { id: 'optimize', label: t('optimizer.tabs.optimize'), icon: Wand2, helpKey: 'optimizer.help.optimizeTab' },
          { id: 'analyze', label: t('optimizer.tabs.analyze'), icon: Eye, helpKey: 'optimizer.help.analyzeTab' },
          { id: 'attacks', label: t('optimizer.tabs.attacks'), icon: Target, helpKey: 'optimizer.help.attacksTab' },
          { id: 'templates', label: t('optimizer.tabs.templates'), icon: BookOpen, helpKey: 'optimizer.help.templatesTab' },
          { id: 'history', label: t('optimizer.tabs.history'), icon: FileText, helpKey: 'optimizer.help.historyTab' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={t(tab.helpKey)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimize Tab */}
        {activeTab === 'optimize' && (
          <>
            <div className="space-y-6">
              {/* Original Prompt */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  {t('optimizer.originalPrompt')}
                </h3>
                <textarea
                  value={originalPrompt}
                  onChange={(e) => setOriginalPrompt(e.target.value)}
                  placeholder={t('optimizer.originalPromptPlaceholder')}
                  className="w-full h-48 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Optimization Type */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  {t('optimizer.optimizationType')}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {OPTIMIZATION_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setOptimizationType(type.value)}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        optimizationType === type.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 ${
                        optimizationType === type.value ? 'text-purple-400' : 'text-gray-400'
                      }`} />
                      <div className="text-left">
                        <p className="font-medium text-white">{t(`optimizer.options.${type.value}.label`)}</p>
                        <p className="text-sm text-gray-400">{t(`optimizer.options.${type.value}.description`)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleOptimize}
                  disabled={!originalPrompt.trim() || optimizing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {optimizing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  {optimizing ? t('optimizer.optimizing') : t('optimizer.optimizeButton')}
                </button>
                
                <button
                  onClick={handleCombine}
                  disabled={successfulAttacks.length < 2 || optimizing}
                  className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={successfulAttacks.length < 2 ? t('optimizer.combineTooltip') : t('optimizer.attacks.optimize')}
                >
                  <Layers className="w-5 h-5" />
                  {t('optimizer.combineButton')}
                </button>
              </div>
            </div>

            {/* Result */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {t('optimizer.optimizedPromptTitle')}
              </h3>
              
              {optimizedResult ? (
                <div className="space-y-4">
                  {/* Karşılaştırma İstatistikleri */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{t('optimizer.comparison.originalLabel')}</p>
                      <p className="text-lg font-bold text-gray-400">{originalPrompt.split(/\s+/).length} {t('optimizer.comparison.wordUnit')}</p>
                    </div>
                    <div className="text-center border-x border-gray-700">
                      <p className="text-xs text-gray-500">{t('optimizer.comparison.optimizedLabel')}</p>
                      <p className="text-lg font-bold text-purple-400">{optimizedResult.optimizedPrompt?.split(/\s+/).length || 0} {t('optimizer.comparison.wordUnit')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">{t('optimizer.comparison.changeLabel')}</p>
                      <p className={`text-lg font-bold ${
                        (optimizedResult.optimizedPrompt?.split(/\s+/).length || 0) >= originalPrompt.split(/\s+/).length 
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {Math.round(((optimizedResult.optimizedPrompt?.split(/\s+/).length || 0) / originalPrompt.split(/\s+/).length - 1) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 max-h-96 overflow-y-auto">
                      <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                        {optimizedResult.optimizedPrompt}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(optimizedResult.optimizedPrompt)}
                      className="absolute top-2 right-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Improvements */}
                  {optimizedResult.improvements?.length > 0 && (
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">{t('optimizer.improvementsTitle')}</h4>
                      <ul className="space-y-2">
                        {optimizedResult.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Analysis */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-sm text-gray-400">{t('optimizer.effectivenessLabel')}</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {optimizedResult.analysis?.expectedEffectiveness || optimizedResult.expectedEffectiveness || 70}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{t('optimizer.riskLabel')}</p>
                      <p className={`text-lg font-medium ${
                        (optimizedResult.analysis?.detectionRisk || optimizedResult.detectionRisk) === 'low' ? 'text-green-400' :
                        (optimizedResult.analysis?.detectionRisk || optimizedResult.detectionRisk) === 'medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {t(`optimizer.detectionRisk.${(optimizedResult.analysis?.detectionRisk || optimizedResult.detectionRisk) || 'medium'}`)}
                      </p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {(optimizedResult.analysis?.reasoning || optimizedResult.reasoning) && (
                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">{t('optimizer.reasoningTitle')}</h4>
                      <p className="text-sm text-gray-300">
                        {optimizedResult.analysis?.reasoning || optimizedResult.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('optimizer.optimizedPromptEmptyTitle')}</p>
                    <p className="text-xs mt-2 text-gray-600">{t('optimizer.optimizedPromptEmptySubtitle')}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <>
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  {t('optimizer.analyze.title')}
                </h3>
                <textarea
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                  placeholder={t('optimizer.analyze.placeholder')}
                  className="w-full h-48 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!analysisPrompt.trim() || analyzing}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {analyzing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  {analyzing ? t('optimizer.analyze.analyzing') : t('optimizer.analyze.analyzeButton')}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">{t('optimizer.analyze.resultTitle')}</h3>
              
              {analysisResult ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="text-center p-4 bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">{t('optimizer.analyze.scoreLabel')}</p>
                    <p className="text-4xl font-bold text-white">{analysisResult.overallScore || 0}</p>
                  </div>

                  {/* Strengths */}
                  {analysisResult.strengths?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">{t('optimizer.analyze.strengthsTitle')}</h4>
                      <ul className="space-y-1">
                        {analysisResult.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {analysisResult.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">{t('optimizer.analyze.weaknessesTitle')}</h4>
                      <ul className="space-y-1">
                        {analysisResult.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-red-400">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysisResult.suggestions?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-2">{t('optimizer.analyze.suggestionsTitle')}</h4>
                      <ul className="space-y-2">
                        {analysisResult.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-gray-900 p-2 rounded">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              s.type === 'add' ? 'bg-green-500/20 text-green-400' :
                              s.type === 'remove' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {s.type === 'add' 
                                ? t('optimizer.analyze.suggestionTypeAdd') 
                                : s.type === 'remove' 
                                  ? t('optimizer.analyze.suggestionTypeRemove') 
                                  : t('optimizer.analyze.suggestionTypeChange')}
                            </span>
                            {s.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => useAsOriginal(analysisPrompt)}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
                  >
                    <Wand2 className="w-4 h-4" />
                    {t('optimizer.analyze.useForOptimize')}
                  </button>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('optimizer.analyze.emptyState')}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Successful Attacks Tab */}
        {activeTab === 'attacks' && (
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                {t('optimizer.attacks.title')} ({successfulAttacks.length})
              </h3>
              
              {successfulAttacks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('optimizer.attacks.emptyTitle')}</p>
                  <p className="text-sm mt-1">{t('optimizer.attacks.emptySubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {successfulAttacks.map((attack) => (
                    <div 
                      key={attack.id}
                      className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedAttack(expandedAttack === attack.id ? null : attack.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-400" />
                          <div className="text-left">
                            <p className="text-white font-medium truncate max-w-md">
                              {attack.attackPrompt.substring(0, 100)}...
                            </p>
                            <p className="text-sm text-gray-400">
                              {attack.technique || t('optimizer.attacks.unknownTechnique')} • {new Date(attack.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}
                            </p>
                          </div>
                        </div>
                        {expandedAttack === attack.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedAttack === attack.id && (
                        <div className="p-4 border-t border-gray-700 space-y-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">{t('optimizer.attacks.attackPromptLabel')}</p>
                            <p className="text-white bg-gray-800 p-3 rounded text-sm">
                              {attack.attackPrompt}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">{t('optimizer.attacks.targetResponseLabel')}</p>
                            <p className="text-gray-300 bg-gray-800 p-3 rounded text-sm">
                              {attack.targetResponse}
                            </p>
                          </div>
                          {attack.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {attack.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => useAsOriginal(attack.attackPrompt)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                            >
                              <Wand2 className="w-4 h-4" />
                              {t('optimizer.attacks.optimize')}
                            </button>
                            <button
                              onClick={() => copyToClipboard(attack.attackPrompt)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                              {t('optimizer.attacks.copy')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  {t('optimizer.templates.title')} ({templates.length})
                </h3>
                <button
                  onClick={seedTemplates}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('optimizer.templates.seedButton')}
                </button>
              </div>
              
              {templates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('optimizer.templates.emptyTitle')}</p>
                  <p className="text-sm mt-1">{t('optimizer.templates.emptySubtitle')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <p className="text-sm text-gray-400">{template.description}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 bg-gray-800 p-2 rounded mb-3 font-mono">
                        {template.template.substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {template.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => useAsOriginal(template.template)}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          {t('optimizer.templates.use')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                {t('optimizer.history.title')} ({optimizedPrompts.length})
              </h3>
              
              {optimizedPrompts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('optimizer.history.emptyTitle')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizedPrompts.map((prompt) => (
                    <div 
                      key={prompt.id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            prompt.optimizationType === 'ENHANCE' ? 'bg-purple-500/20 text-purple-400' :
                            prompt.optimizationType === 'COMBINE' ? 'bg-blue-500/20 text-blue-400' :
                            prompt.optimizationType === 'ADAPT' ? 'bg-green-500/20 text-green-400' :
                            prompt.optimizationType === 'SIMPLIFY' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {prompt.optimizationType}
                          </span>
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(prompt.createdAt).toLocaleString(
                              language === 'en' ? 'en-US' : 'tr-TR'
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400 mt-1">
                            {t('optimizer.history.successLabel')}{Math.round(prompt.successRate * 100)}%
                          </p>
                          <button
                            onClick={() => optimizerApi.deleteOptimized(prompt.id).then(loadData)}
                            className="p-1 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-white text-sm bg-gray-800 p-3 rounded">
                        {prompt.optimizedPrompt.substring(0, 200)}...
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => copyToClipboard(prompt.optimizedPrompt)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                          {t('optimizer.history.copy')}
                        </button>
                        <button
                          onClick={() => useAsOriginal(prompt.optimizedPrompt)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                        >
                          <Wand2 className="w-3 h-3" />
                          {t('optimizer.history.reOptimize')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
