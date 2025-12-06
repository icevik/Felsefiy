import { useLanguage } from '../lib/i18n';

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (lang) => {
    if (lang === language) return;
    if (lang === 'tr' || lang === 'en') {
      setLanguage(lang);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-xs text-dark-400">
      <span className="uppercase tracking-wide text-[10px] text-dark-500">
        {t('common.language')}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleChange('tr')}
          className={`flex-1 px-2 py-1 rounded border text-center transition text-[11px] ${
            language === 'tr'
              ? 'bg-accent-red/20 border-accent-red text-accent-red'
              : 'bg-dark-800 border-dark-700 text-dark-300 hover:bg-dark-700'
          }`}
        >
          TR
        </button>
        <button
          type="button"
          onClick={() => handleChange('en')}
          className={`flex-1 px-2 py-1 rounded border text-center transition text-[11px] ${
            language === 'en'
              ? 'bg-accent-red/20 border-accent-red text-accent-red'
              : 'bg-dark-800 border-dark-700 text-dark-300 hover:bg-dark-700'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
