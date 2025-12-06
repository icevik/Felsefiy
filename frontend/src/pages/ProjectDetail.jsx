import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Settings, 
  Activity,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Zap,
  StopCircle,
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  Shield,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  Eye
} from 'lucide-react';
import { projectsApi, sessionsApi, strategiesApi, reportsApi } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../lib/i18n';
import HelpTooltip from '../components/HelpTooltip';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [project, setProject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [maxRounds, setMaxRounds] = useState(10);
  const [starting, setStarting] = useState(false);
  const [attackGoal, setAttackGoal] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Batch attack states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [sessionCount, setSessionCount] = useState(5);
  const [batchStarting, setBatchStarting] = useState(false);
  const [activeBatch, setActiveBatch] = useState(null);
  const [batchPolling, setBatchPolling] = useState(null);
  
  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [showPastReports, setShowPastReports] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    executiveSummary: true,
    vulnerabilityAnalysis: false,
    attackPatterns: false,
    successfulTechniques: false,
    riskAssessment: false,
    recommendations: false
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [projectRes, sessionsRes, strategiesRes] = await Promise.all([
        projectsApi.getOne(id),
        sessionsApi.getAll({ projectId: id, limit: 20 }),
        strategiesApi.getAll()
      ]);

      setProject(projectRes.data);
      setSessions(sessionsRes.data);
      setStrategies(strategiesRes.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    setStarting(true);
    try {
      const res = await sessionsApi.create({
        projectId: id,
        strategyId: selectedStrategy || null,
        maxRounds,
        attackGoal: attackGoal || null,
        customInstructions: customInstructions || null
      });
      
      navigate(`/sessions/${res.data.id}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert(t('projectDetail.errors.startSessionFailed') + (error.response?.data?.error || error.message));
    } finally {
      setStarting(false);
    }
  };

  // Batch attack handlers
  const handleStartBatch = async () => {
    setBatchStarting(true);
    try {
      const res = await sessionsApi.createBatch({
        projectId: id,
        strategyId: selectedStrategy || null,
        maxRounds,
        sessionCount,
        customInstructions: customInstructions || null,
        delayBetweenMs: 1000
      });
      
      setActiveBatch(res.data);
      setShowBatchModal(false);
      
      // Start polling for batch status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await sessionsApi.getBatchStatus(res.data.batchId);
          setActiveBatch(prev => ({ ...prev, ...statusRes.data }));
          
          // Reload sessions list
          const sessionsRes = await sessionsApi.getAll({ projectId: id, limit: 50 });
          setSessions(sessionsRes.data);
          
          // Stop polling when all sessions are done
          if (statusRes.data.stats.running === 0) {
            clearInterval(pollInterval);
            setBatchPolling(null);
            // Reload project stats
            const projectRes = await projectsApi.getOne(id);
            setProject(projectRes.data);
          }
        } catch (err) {
          console.error('Batch polling error:', err);
        }
      }, 3000);
      
      setBatchPolling(pollInterval);
    } catch (error) {
      console.error('Failed to start batch:', error);
      alert(t('projectDetail.errors.startBatchFailed') + (error.response?.data?.error || error.message));
    } finally {
      setBatchStarting(false);
    }
  };

  const handleStopBatch = async () => {
    if (!activeBatch?.batchId) return;
    
    try {
      await sessionsApi.stopBatch(activeBatch.batchId);
      if (batchPolling) {
        clearInterval(batchPolling);
        setBatchPolling(null);
      }
      setActiveBatch(null);
      loadData();
    } catch (error) {
      console.error('Failed to stop batch:', error);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (batchPolling) {
        clearInterval(batchPolling);
      }
    };
  }, [batchPolling]);

  // Report handlers
  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await reportsApi.generate(id);
      setReport(res.data);
      // Refresh past reports list
      loadPastReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert(t('projectDetail.errors.generateReportFailed') + (error.response?.data?.message || error.message));
    } finally {
      setReportLoading(false);
    }
  };

  const loadPastReports = async () => {
    try {
      const res = await reportsApi.getByProject(id);
      setPastReports(res.data);
    } catch (error) {
      console.error('Failed to load past reports:', error);
    }
  };

  const handleViewPastReport = async (reportId) => {
    setReportLoading(true);
    try {
      const res = await reportsApi.getOne(reportId);
      setReport(res.data);
      setShowPastReports(false);
    } catch (error) {
      console.error('Failed to load report:', error);
      alert(t('projectDetail.errors.loadReportFailed'));
    } finally {
      setReportLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm(t('projectDetail.errors.deleteReportConfirm'))) return;
    try {
      await reportsApi.delete(reportId);
      setPastReports(prev => prev.filter(r => r.id !== reportId));
      if (report?.id === reportId) {
        setReport(null);
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleExportReport = () => {
    if (!report) return;
    
    const isEn = language === 'en';
    const markdown = isEn
      ? `# Security Test Report

## Project Information
- **Project Name:** ${report.projectName}
- **Report Date:** ${new Date(report.generatedAt).toLocaleString('en-US')}
- **Analysis Model:** ${report.model}

## Statistics
| Metric | Value |
|--------|-------|
| Total Sessions | ${report.rawData.totalSessions} |
| Successful Attacks | ${report.rawData.successfulAttacks} |
| Failed | ${report.rawData.failedAttacks} |
| Detected | ${report.rawData.detectedAttacks} |
| Success Rate | ${report.statistics.successRate}% |

---

## Executive Summary

${report.sections.executiveSummary}

---

## Vulnerability Analysis

${report.sections.vulnerabilityAnalysis}

---

## Attack Patterns

${report.sections.attackPatterns}

---

## Successful Techniques

${report.sections.successfulTechniques}

---

## Risk Assessment

${report.sections.riskAssessment}

---

## Recommendations

${report.sections.recommendations}

---

*This report was automatically generated by the Felsefiy AI Security Testing Platform.*
`
      : `# Güvenlik Test Raporu

## Proje Bilgileri
- **Proje Adı:** ${report.projectName}
- **Rapor Tarihi:** ${new Date(report.generatedAt).toLocaleString('tr-TR')}
- **Analiz Modeli:** ${report.model}

## İstatistikler
| Metrik | Değer |
|--------|-------|
| Toplam Oturum | ${report.rawData.totalSessions} |
| Başarılı Saldırı | ${report.rawData.successfulAttacks} |
| Başarısız | ${report.rawData.failedAttacks} |
| Tespit Edilen | ${report.rawData.detectedAttacks} |
| Başarı Oranı | %${report.statistics.successRate} |

---

## Yönetici Özeti

${report.sections.executiveSummary}

---

## Güvenlik Açığı Analizi

${report.sections.vulnerabilityAnalysis}

---

## Saldırı Kalıpları

${report.sections.attackPatterns}

---

## Başarılı Teknikler

${report.sections.successfulTechniques}

---

## Risk Değerlendirmesi

${report.sections.riskAssessment}

---

## Öneriler

${report.sections.recommendations}

---

*Bu rapor Felsefiy AI Security Testing Platform tarafından otomatik olarak oluşturulmuştur.*
`;

    // Download as file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapor-${project.name}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadge = (status, result) => {
    if (status === 'RUNNING') {
      return <span className="px-2 py-1 text-xs bg-accent-blue/20 text-accent-blue rounded animate-pulse">{t('status.running')}</span>;
    }
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-accent-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-dark-400">{t('projectDetail.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-dark-800 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-dark-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <HelpTooltip helpKey="projectDetail.help.header" />
          </div>
        </div>
        <button
          onClick={() => {
            setShowReportModal(true);
            loadPastReports();
          }}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white rounded-lg transition"
        >
          <FileText className="w-5 h-5" />
          {t('projectDetail.header.reportButton')}
          <HelpTooltip helpKey="projectDetail.help.headerReportButton" />
        </button>
        <Link
          to={`/projects/${id}/optimizer`}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-lg transition"
        >
          <Sparkles className="w-5 h-5" />
          {t('projectDetail.header.optimizerButton')}
          <HelpTooltip helpKey="projectDetail.help.headerOptimizerButton" />
        </Link>
        <button
          onClick={() => setShowBatchModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white rounded-lg transition"
        >
          <Layers className="w-5 h-5" />
          {t('projectDetail.header.batchButton')}
          <HelpTooltip helpKey="projectDetail.help.headerBatchButton" />
        </button>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition"
        >
          <Play className="w-5 h-5" />
          {t('projectDetail.header.singleTestButton')}
          <HelpTooltip helpKey="projectDetail.help.headerSingleTestButton" />
        </button>
      </div>

      {/* Active Batch Status */}
      {activeBatch && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-orange-400 animate-pulse" />
              <div>
                <h3 className="text-white font-semibold">{t('projectDetail.batchStatus.title')}</h3>
                <p className="text-sm text-dark-400">
                  {t('projectDetail.batchStatus.startedSessions', { count: activeBatch.sessionCount })}
                </p>
              </div>
            </div>
            <button
              onClick={handleStopBatch}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
            >
              <StopCircle className="w-4 h-4" />
              {t('projectDetail.batchStatus.stopAll')}
            </button>
          </div>
          
          {activeBatch.stats && (
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{activeBatch.stats.total}</p>
                <p className="text-xs text-dark-400">{t('projectDetail.batchStatus.total')}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-accent-blue">{activeBatch.stats.running}</p>
                <p className="text-xs text-dark-400">{t('projectDetail.batchStatus.running')}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-accent-green">{activeBatch.stats.success}</p>
                <p className="text-xs text-dark-400">{t('projectDetail.batchStatus.success')}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-accent-red">{activeBatch.stats.failed}</p>
                <p className="text-xs text-dark-400">{t('projectDetail.batchStatus.failed')}</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-accent-yellow">{activeBatch.stats.detected}</p>
                <p className="text-xs text-dark-400">{t('projectDetail.batchStatus.detected')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-accent-blue" />
            <div>
              <p className="text-2xl font-bold text-white">{project.totalSessions}</p>
              <p className="text-sm text-dark-400">{t('projectDetail.stats.totalSessions')}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-accent-green" />
            <div>
              <p className="text-2xl font-bold text-white">{project.successfulJailbreaks}</p>
              <p className="text-sm text-dark-400">{t('projectDetail.stats.successful')}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-accent-red" />
            <div>
              <p className="text-2xl font-bold text-white">{project.totalSessions - project.successfulJailbreaks}</p>
              <p className="text-sm text-dark-400">{t('projectDetail.stats.failed')}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-accent-purple" />
            <div>
              <p className="text-2xl font-bold text-white">
                {project.totalSessions > 0 
                  ? Math.round((project.successfulJailbreaks / project.totalSessions) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-dark-400">{t('projectDetail.stats.successRate')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-dark-400" />
            {t('projectDetail.config.apiConfigTitle')}
            <HelpTooltip helpKey="projectDetail.help.configCard" />
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-dark-400">{t('projectDetail.config.methodUrlLabel')}</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-2 bg-accent-blue/20 text-accent-blue rounded text-sm font-mono">
                  {project.method}
                </span>
                <code className="flex-1 px-3 py-2 bg-dark-800 rounded text-sm text-dark-200 truncate">
                  {project.targetUrl}
                </code>
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-400">{t('projectDetail.config.headersLabel')}</label>
              <pre className="mt-1 px-3 py-2 bg-dark-800 rounded text-sm text-dark-200 overflow-x-auto">
                {JSON.stringify(project.headers, null, 2)}
              </pre>
            </div>
            <div>
              <label className="text-sm text-dark-400">{t('projectDetail.config.bodyTemplateLabel')}</label>
              <pre className="mt-1 px-3 py-2 bg-dark-800 rounded text-sm text-dark-200 overflow-x-auto">
                {project.bodyTemplate}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {t('projectDetail.models.title')}
            <HelpTooltip helpKey="projectDetail.help.modelsCard" />
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-dark-400">{t('projectDetail.models.attacker')}</label>
              <p className="text-white mt-1">{project.attackerModel}</p>
            </div>
            <div>
              <label className="text-sm text-dark-400">{t('projectDetail.models.moderator')}</label>
              <p className="text-white mt-1">{project.moderatorModel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-white">{t('projectDetail.sessions.title')}</h2>
          <HelpTooltip helpKey="projectDetail.help.sessionsCard" />
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('projectDetail.sessions.emptyTitle')}</p>
            <button
              onClick={() => setShowStartModal(true)}
              className="text-accent-red hover:underline mt-2"
            >
              {t('projectDetail.sessions.emptyCta')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
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
                    <p className="text-white font-medium">
                      {session.strategy?.name || t('projectDetail.sessions.noStrategy')}
                    </p>
                    <p className="text-sm text-dark-400">
                      {t('dashboard.roundLabel', { current: session.totalRounds, max: session.maxRounds })} • 
                      {new Date(session.startedAt).toLocaleString(
                        language === 'en' ? 'en-US' : 'tr-TR',
                        { dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    </p>
                  </div>
                </div>
                {getStatusBadge(session.status, session.result)}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl border border-dark-700 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-6">{t('projectDetail.startModal.title')}</h2>
            
            <div className="space-y-4">
              {/* Saldırı Hedefi */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">
                  {t('projectDetail.startModal.attackGoalLabel')} <span className="text-dark-500">{t('projectDetail.startModal.attackGoalHint')}</span>
                </label>
                <textarea
                  value={attackGoal}
                  onChange={(e) => setAttackGoal(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none"
                  placeholder={t('projectDetail.startModal.attackGoalPlaceholder')}
                />
              </div>

              {/* Strateji Seçimi */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">{t('projectDetail.startModal.strategyLabel')}</label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-accent-red"
                >
                  <option value="">{t('projectDetail.startModal.strategyAutoOption')}</option>
                  {strategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">{t('projectDetail.startModal.strategyHint')}</p>
              </div>

              {/* Özel Talimatlar */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">
                  {t('projectDetail.startModal.instructionsLabel')} <span className="text-dark-500">{t('projectDetail.startModal.instructionsHint')}</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red resize-none"
                  placeholder={t('projectDetail.startModal.instructionsPlaceholder')}
                />
              </div>

              {/* Maksimum Round */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">{t('projectDetail.startModal.maxRoundsLabel')}</label>
                <input
                  type="number"
                  value={maxRounds}
                  onChange={(e) => setMaxRounds(parseInt(e.target.value) || 10)}
                  min={1}
                  max={50}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-accent-red"
                />
                <p className="text-xs text-dark-500 mt-1">{t('projectDetail.startModal.maxRoundsHint')}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setAttackGoal('');
                  setCustomInstructions('');
                }}
                className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
              >
                {t('projectDetail.startModal.cancel')}
              </button>
              <button
                onClick={handleStartSession}
                disabled={starting}
                className="flex items-center gap-2 px-6 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {starting ? t('projectDetail.startModal.starting') : t('projectDetail.startModal.startButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Attack Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl border border-dark-700 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{t('projectDetail.batchModal.title')}</h2>
                <p className="text-sm text-dark-400">{t('projectDetail.batchModal.subtitle')}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Oturum Sayısı */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">{t('projectDetail.batchModal.sessionCountLabel')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    value={sessionCount}
                    onChange={(e) => setSessionCount(parseInt(e.target.value))}
                    min={2}
                    max={20}
                    className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-2xl font-bold text-orange-400 w-12 text-center">{sessionCount}</span>
                </div>
                <p className="text-xs text-dark-500 mt-1">{t('projectDetail.batchModal.sessionCountHint')}</p>
              </div>

              {/* Strateji Seçimi */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">Saldırı Stratejisi</label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">{t('projectDetail.batchModal.mixedOption')}</option>
                  {strategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Özel Talimatlar */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">
                  {t('projectDetail.batchModal.commonInstructionsLabel')} <span className="text-dark-500">{t('projectDetail.batchModal.commonInstructionsHint')}</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-orange-500 resize-none"
                  placeholder={t('projectDetail.batchModal.commonInstructionsPlaceholder')}
                />
              </div>

              {/* Maksimum Round */}
              <div>
                <label className="block text-sm text-dark-300 mb-2">{t('projectDetail.batchModal.maxRoundsLabel')}</label>
                <input
                  type="number"
                  value={maxRounds}
                  onChange={(e) => setMaxRounds(parseInt(e.target.value) || 10)}
                  min={1}
                  max={30}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Bilgi Kutusu */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <h4 className="text-orange-400 font-medium mb-2">{t('projectDetail.batchModal.howItWorksTitle')}</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  {t('projectDetail.batchModal.howItWorksItems').map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setCustomInstructions('');
                }}
                className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
              >
                {t('projectDetail.batchModal.cancel')}
              </button>
              <button
                onClick={handleStartBatch}
                disabled={batchStarting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white rounded-lg transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {batchStarting ? t('projectDetail.batchModal.starting') : t('projectDetail.batchModal.startButton', { count: sessionCount })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl border border-dark-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('projectDetail.reportModal.title')}</h2>
                  <p className="text-sm text-dark-400">{t('projectDetail.reportModal.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {report && (
                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    {t('projectDetail.reportModal.downloadMarkdown')}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReport(null);
                  }}
                  className="p-2 hover:bg-dark-700 rounded-lg transition"
                >
                  <XCircle className="w-5 h-5 text-dark-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!report && !reportLoading && (
                <div className="space-y-6">
                  <div className="bg-dark-900/70 rounded-xl border border-dark-700 p-4 text-sm text-dark-300">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      {t('projectDetail.reportModal.help.title')}
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-dark-300">
                      <li>{t('projectDetail.reportModal.help.step1')}</li>
                      <li>{t('projectDetail.reportModal.help.step2')}</li>
                      <li>{t('projectDetail.reportModal.help.step3')}</li>
                      <li>{t('projectDetail.reportModal.help.step4')}</li>
                    </ol>
                  </div>
                  {/* New Report Section */}
                  <div className="text-center py-8 bg-dark-800/50 rounded-xl border border-dark-700">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-dark-500" />
                    <h3 className="text-lg font-medium text-white mb-2">{t('projectDetail.reportModal.newReportTitle')}</h3>
                    <p className="text-dark-400 mb-4 max-w-md mx-auto text-sm">{t('projectDetail.reportModal.newReportDescription')}</p>

                    <button
                      onClick={handleGenerateReport}
                      disabled={sessions.length === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white rounded-lg transition mx-auto disabled:opacity-50"
                    >
                      <FileText className="w-5 h-5" />
                      {t('projectDetail.reportModal.newReportButton')}
                    </button>
                    
                    {sessions.length === 0 && (
                      <p className="text-dark-500 text-sm mt-3">{t('projectDetail.reportModal.newReportSessionsHint')}</p>
                    )}
                  </div>

                  {/* Past Reports Section */}
                  {pastReports.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <History className="w-5 h-5 text-dark-400" />
                        <h3 className="text-lg font-medium text-white">{t('projectDetail.reportModal.pastReportsTitle')}</h3>
                        <span className="text-sm text-dark-400">({pastReports.length})</span>
                      </div>
                      <div className="space-y-2">
                        {pastReports.map((r) => (
                          <div 
                            key={r.id}
                            className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700 hover:border-dark-600 transition"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {new Date(r.createdAt).toLocaleDateString('tr-TR', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-sm text-dark-400">
                                  {t('projectDetail.reportModal.pastReportsStats', {
                                    tests: r.totalSessions,
                                    success: r.successfulAttacks,
                                    rate: r.successRate
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPastReport(r.id)}
                                className="p-2 hover:bg-dark-700 rounded-lg transition text-emerald-400"
                                title={t('projectDetail.reportModal.pastReportsView')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReport(r.id)}
                                className="p-2 hover:bg-dark-700 rounded-lg transition text-red-400"
                                title={t('projectDetail.reportModal.pastReportsDelete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {reportLoading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-emerald-500 animate-spin" />
                  <h3 className="text-lg font-medium text-white mb-2">{t('projectDetail.reportModal.loadingTitle')}</h3>
                  <p className="text-dark-400">{t('projectDetail.reportModal.loadingDescription')}</p>
                </div>
              )}

              {report && (
                <div className="space-y-4">
                  {/* Back Button */}
                  <button
                    onClick={() => setReport(null)}
                    className="flex items-center gap-2 text-dark-400 hover:text-white transition mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">{t('projectDetail.reportModal.backToReports')}</span>
                  </button>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    <div className="bg-dark-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-white">{report.rawData.totalSessions}</p>
                      <p className="text-xs text-dark-400">{t('projectDetail.reportStats.totalTests')}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{report.rawData.successfulAttacks}</p>
                      <p className="text-xs text-dark-400">{t('projectDetail.reportStats.successful')}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">{report.rawData.failedAttacks}</p>
                      <p className="text-xs text-dark-400">{t('projectDetail.reportStats.failed')}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{report.rawData.detectedAttacks}</p>
                      <p className="text-xs text-dark-400">{t('projectDetail.reportStats.detected')}</p>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">%{report.statistics.successRate}</p>
                      <p className="text-xs text-dark-400">{t('projectDetail.reportStats.successRate')}</p>
                    </div>
                  </div>

                  {/* Report Sections */}
                  {[ 
                    { key: 'executiveSummary', titleKey: 'projectDetail.reportSections.executiveSummary', icon: BookOpen, color: 'text-blue-400' },
                    { key: 'vulnerabilityAnalysis', titleKey: 'projectDetail.reportSections.vulnerabilityAnalysis', icon: AlertTriangle, color: 'text-red-400' },
                    { key: 'attackPatterns', titleKey: 'projectDetail.reportSections.attackPatterns', icon: Target, color: 'text-orange-400' },
                    { key: 'successfulTechniques', titleKey: 'projectDetail.reportSections.successfulTechniques', icon: TrendingUp, color: 'text-emerald-400' },
                    { key: 'riskAssessment', titleKey: 'projectDetail.reportSections.riskAssessment', icon: Shield, color: 'text-purple-400' },
                    { key: 'recommendations', titleKey: 'projectDetail.reportSections.recommendations', icon: Sparkles, color: 'text-yellow-400' }
                  ].map(({ key, titleKey, icon: Icon, color }) => (
                    <div key={key} className="bg-dark-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(key)}
                        className="w-full flex items-center justify-between p-4 hover:bg-dark-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${color}`} />
                          <span className="font-medium text-white">{t(titleKey)}</span>
                        </div>
                        {expandedSections[key] ? (
                          <ChevronUp className="w-5 h-5 text-dark-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-dark-400" />
                        )}
                      </button>
                      {expandedSections[key] && (
                        <div className="px-4 pb-4">
                          <div className="prose prose-invert prose-sm max-w-none 
                            prose-headings:text-white prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                            prose-p:text-dark-200 prose-p:leading-relaxed prose-p:my-2
                            prose-strong:text-white prose-strong:font-semibold
                            prose-ul:text-dark-200 prose-ul:my-2 prose-li:my-1
                            prose-ol:text-dark-200 prose-ol:my-2
                            prose-table:text-dark-200 prose-th:text-white prose-th:bg-dark-700 prose-th:px-3 prose-th:py-2
                            prose-td:px-3 prose-td:py-2 prose-td:border-dark-600
                            prose-hr:border-dark-600 prose-hr:my-4
                            prose-code:text-emerald-400 prose-code:bg-dark-700 prose-code:px-1 prose-code:rounded">
                            <ReactMarkdown>{report.sections[key]}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Strategy Stats */}
                  {report.statistics.strategyStats && Object.keys(report.statistics.strategyStats).length > 0 && (
                    <div className="bg-dark-800 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">{t('projectDetail.strategyStats.title')}</h4>
                      <div className="space-y-2">
                        {Object.entries(report.statistics.strategyStats).map(([name, stats]) => (
                          <div key={name} className="flex items-center justify-between">
                            <span className="text-dark-300">{name}</span>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-emerald-400">{t('projectDetail.strategyStats.success', { count: stats.success })}</span>
                              <span className="text-yellow-400">{t('projectDetail.strategyStats.detected', { count: stats.detected })}</span>
                              <span className="text-dark-400">{t('projectDetail.strategyStats.total', { count: stats.total })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {report && (
              <div className="p-4 border-t border-dark-700 bg-dark-800/50">
                <div className="flex items-center justify-between text-sm text-dark-400">
                  <span>
                    {t('projectDetail.footer.generatedAt')}
                    {new Date(report.generatedAt).toLocaleString(
                      language === 'en' ? 'en-US' : 'tr-TR'
                    )}
                  </span>
                  <span>
                    {t('projectDetail.footer.model')}
                    {report.model}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
