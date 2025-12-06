import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

function HelpTooltip({ helpKey }) {
  const { t } = useLanguage();
  const text = helpKey ? t(helpKey) : '';

  if (!text || typeof text !== 'string') return null;

  return (
    <span className="relative inline-flex items-center group ml-1 align-middle">
      <HelpCircle className="w-4 h-4 text-dark-400 group-hover:text-dark-200 cursor-help" />
      <span className="pointer-events-none absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 whitespace-pre-line rounded-md bg-dark-900 px-3 py-2 text-xs text-dark-50 shadow-lg border border-dark-700 opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-[200px] max-w-xs">
        {text}
      </span>
    </span>
  );
}

export default HelpTooltip;
