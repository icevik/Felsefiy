import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { authApi } from '../lib/api';
import { useLanguage } from '../lib/i18n';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      const token = res.data?.token;
      if (token) {
        window.localStorage.setItem('authToken', token);
        const redirectTo = location.state?.from?.pathname || '/';
        navigate(redirectTo, { replace: true });
      } else {
        setError(t('login.unexpectedResponse'));
      }
    } catch (err) {
      const message = err.response?.data?.error || t('login.loginFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-8 shadow-xl shadow-black/40">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-red/20 flex items-center justify-center mb-3">
            <Shield className="w-8 h-8 text-accent-red" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('login.title')}</h1>
          <p className="text-sm text-dark-400 text-center">
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1.5">{t('login.usernameLabel')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red"
              placeholder={t('login.usernamePlaceholder')}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1.5">{t('login.passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent-red"
              placeholder={t('login.passwordPlaceholder')}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-lg border border-dark-700 bg-dark-900/70 text-xs text-dark-300 space-y-2">
          <h2 className="text-sm font-semibold text-white">
            {t('login.help.title')}
          </h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>{t('login.help.step1')}</li>
            <li>{t('login.help.step2')}</li>
            <li>{t('login.help.step3')}</li>
          </ol>
          <p className="text-[11px] text-dark-500">
            {t('login.help.security')}
          </p>
        </div>

        <p className="mt-6 text-xs text-dark-500 text-center">
          {t('login.footerNote')}
        </p>
      </div>
    </div>
  );
}

export default Login;
