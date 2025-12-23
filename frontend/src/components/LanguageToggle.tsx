"use client";

import { useLanguage, Language } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { id: 'es' as Language, name: 'Español', flag: '🇪🇸', short: 'ES' },
    { id: 'en' as Language, name: 'English', flag: '🇬🇧', short: 'EN' }
  ];

  return (
    <div className="flex items-center gap-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => setLanguage(lang.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md
            transition-all duration-200 text-sm font-medium
            ${language === lang.id
              ? 'bg-[rgb(var(--primary))] text-white shadow-sm'
              : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
            }
          `}
          title={lang.name}
        >
          <span className="text-base">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.short}</span>
        </button>
      ))}
    </div>
  );
}