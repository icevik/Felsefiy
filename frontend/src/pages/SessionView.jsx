import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Square, 
  Terminal,
  User,
  Bot,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { sessionsApi } from '../lib/api';
import socketService from '../lib/socket';
import { useLanguage } from '../lib/i18n';

function SessionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    loadSession();
    
    // Connect to socket
    socketService.connect();
    
    // Wait for connection before joining
    const joinInterval = setInterval(() => {
      if (socketService.socket?.connected) {
        socketService.joinSession(id);
        clearInterval(joinInterval);
      }
    }, 100);

    // Listen for real-time updates
    socketService.on('new-message', handleNewMessage);
    socketService.on('session-ended', handleSessionEnded);
    socketService.on('session-error', handleSessionError);

    // Polling fallback for messages (her 3 saniyede)
    const pollInterval = setInterval(async () => {
      try {
        const res = await sessionsApi.getOne(id);
        if (res.data.messages?.length > messages.length) {
          setMessages(res.data.messages);
        }
        if (res.data.status !== session?.status) {
          setSession(res.data);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => {
      clearInterval(joinInterval);
      clearInterval(pollInterval);
      socketService.leaveSession(id);
      socketService.off('new-message', handleNewMessage);
      socketService.off('session-ended', handleSessionEnded);
      socketService.off('session-error', handleSessionError);
    };
  }, [id]);

  useEffect(() => {
    // Auto-scroll to bottom only if autoScroll is enabled
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setAutoScroll(isNearBottom);
  };

  const loadSession = async () => {
    try {
      const res = await sessionsApi.getOne(id);
      setSession(res.data);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Failed to load session:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      ...message,
      createdAt: new Date().toISOString()
    }]);
  };

  const handleSessionEnded = ({ status, result }) => {
    setSession(prev => prev ? { ...prev, status, result } : null);
  };

  const handleSessionError = ({ error }) => {
    console.error('Session error:', error);
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await sessionsApi.stop(id);
      setSession(prev => prev ? { ...prev, status: 'PAUSED' } : null);
    } catch (error) {
      console.error('Failed to stop session:', error);
    } finally {
      setStopping(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ATTACKER':
        return <User className="w-5 h-5 text-accent-red" />;
      case 'TARGET':
        return <Bot className="w-5 h-5 text-accent-blue" />;
      case 'MODERATOR':
        return <Shield className="w-5 h-5 text-accent-purple" />;
      case 'SYSTEM':
        return <AlertCircle className="w-5 h-5 text-accent-yellow" />;
      default:
        return <Terminal className="w-5 h-5 text-dark-400" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ATTACKER': return t('sessionView.role.attacker');
      case 'TARGET': return t('sessionView.role.target');
      case 'MODERATOR': return t('sessionView.role.moderator');
      case 'SYSTEM': return t('sessionView.role.system');
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ATTACKER': return 'border-accent-red/30 bg-accent-red/5';
      case 'TARGET': return 'border-accent-blue/30 bg-accent-blue/5';
      case 'MODERATOR': return 'border-accent-purple/30 bg-accent-purple/5';
      case 'SYSTEM': return 'border-accent-yellow/30 bg-accent-yellow/5';
      default: return 'border-dark-600 bg-dark-800';
    }
  };

  const getStatusBadge = () => {
    if (!session) return null;
    
    if (session.status === 'RUNNING') {
      return (
        <span className="flex items-center gap-2 px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm">
          <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
          {t('sessionView.statusRunning')}
        </span>
      );
    }

    switch (session.result) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-sm">
            <CheckCircle2 className="w-4 h-4" />
            {t('sessionView.statusSuccess')}
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-accent-red/20 text-accent-red rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            {t('sessionView.statusFailed')}
          </span>
        );
      case 'DETECTED':
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            {t('sessionView.statusDetected')}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 px-3 py-1 bg-dark-600 text-dark-300 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            {t('sessionView.statusOther', { status: session.status })}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-accent-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-dark-400">{t('sessionView.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/projects/${session.projectId}`)}
            className="p-2 hover:bg-dark-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{session.project?.name}</h1>
            <p className="text-sm text-dark-400">
              {session.strategy?.name || t('dashboard.noStrategy')} •
              {t('dashboard.roundLabel', { current: session.totalRounds, max: session.maxRounds })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {getStatusBadge()}

          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="text-xs text-dark-400 hover:text-white underline-offset-2 hover:underline"
          >
            {t('sessionView.helpToggle')}
          </button>

          {session.status === 'RUNNING' && (
            <button
              onClick={handleStop}
              disabled={stopping}
              className="flex items-center gap-2 px-4 py-2 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition disabled:opacity-50"
            >
              <Square className="w-4 h-4" />
              {stopping ? t('sessionView.stopping') : t('sessionView.stop')}
            </button>
          )}
        </div>
      </div>

      {/* How it works / Help */}
      {showHelp && (
        <div className="px-6 pt-4">
          <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 mb-4">
            <h2 className="text-sm font-semibold text-white mb-2">
              {t('sessionView.help.title')}
            </h2>
            <ol className="list-decimal list-inside text-xs text-dark-300 space-y-1">
              <li>{t('sessionView.help.step1')}</li>
              <li>{t('sessionView.help.step2')}</li>
              <li>{t('sessionView.help.step3')}</li>
              <li>{t('sessionView.help.step4')}</li>
            </ol>
            <p className="mt-2 text-[11px] text-dark-500">
              {t('sessionView.help.note')}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('sessionView.waitingMessages')}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={message.id || index} 
              message={message}
              getRoleIcon={getRoleIcon}
              getRoleLabel={getRoleLabel}
              getRoleColor={getRoleColor}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!autoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            setAutoScroll(true);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="fixed bottom-24 right-8 px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-full shadow-lg transition flex items-center gap-2"
        >
          <span className="text-sm">{t('sessionView.scrollToBottom')}</span>
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </button>
      )}

      {/* Footer */}
      {session.status === 'RUNNING' && (
        <div className="p-4 border-t border-dark-700 bg-dark-900">
          <div className="flex items-center justify-center gap-2 text-dark-400">
            <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
            <span className="text-sm">{t('sessionView.loopRunning')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, getRoleIcon, getRoleLabel, getRoleColor }) {
  const [expanded, setExpanded] = useState(false);
  const { t, language } = useLanguage();
  const content = message.content || '';
  const isLong = content.length > 500;
  const displayContent = isLong && !expanded ? content.substring(0, 500) + '...' : content;

  // Parse moderator analysis if available
  let analysis = null;
  if (message.role === 'MODERATOR' && message.analysis) {
    analysis = typeof message.analysis === 'string' 
      ? JSON.parse(message.analysis) 
      : message.analysis;
  }

  return (
    <div className={`rounded-xl border p-4 ${getRoleColor(message.role)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getRoleIcon(message.role)}
          <span className="font-medium text-white">{getRoleLabel(message.role)}</span>
          {message.round > 0 && (
            <span className="text-xs text-dark-400 bg-dark-700 px-2 py-0.5 rounded">
              {t('sessionView.roundLabel', { round: message.round })}
            </span>
          )}
        </div>
        <span className="text-xs text-dark-500">
          {new Date(message.createdAt).toLocaleTimeString(
            language === 'en' ? 'en-US' : 'tr-TR'
          )}
        </span>
      </div>

      {/* Content */}
      <div className="text-dark-200 whitespace-pre-wrap break-words terminal-text text-sm">
        {displayContent}
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-accent-red text-sm mt-2 hover:underline"
        >
          {expanded ? t('sessionView.showLess') : t('sessionView.showMore')}
        </button>
      )}

      {/* Moderator Analysis */}
      {analysis && (
        <div className="mt-4 pt-4 border-t border-dark-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-dark-400">{t('sessionView.analysis.success')}</span>
              <span className={`ml-2 ${analysis.success ? 'text-accent-green' : 'text-accent-red'}`}>
                {analysis.success ? t('sessionView.analysis.yes') : t('sessionView.analysis.no')}
              </span>
            </div>
            <div>
              <span className="text-dark-400">{t('sessionView.analysis.detected')}</span>
              <span className={`ml-2 ${analysis.detected ? 'text-accent-yellow' : 'text-dark-200'}`}>
                {analysis.detected ? t('sessionView.analysis.yes') : t('sessionView.analysis.no')}
              </span>
            </div>
            <div>
              <span className="text-dark-400">{t('sessionView.analysis.confidence')}</span>
              <span className="ml-2 text-white">{analysis.confidence}%</span>
            </div>
            <div>
              <span className="text-dark-400">{t('sessionView.analysis.shouldContinue')}</span>
              <span className={`ml-2 ${analysis.shouldContinue ? 'text-accent-blue' : 'text-dark-400'}`}>
                {analysis.shouldContinue ? t('sessionView.analysis.yes') : t('sessionView.analysis.no')}
              </span>
            </div>
          </div>
          {analysis.nextStrategy && (
            <p className="mt-2 text-sm text-dark-300">
              <span className="text-dark-400">{t('sessionView.analysis.nextStrategy')}</span> {analysis.nextStrategy}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SessionView;
