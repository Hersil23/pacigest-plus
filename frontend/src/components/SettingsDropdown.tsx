"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';

export default function SettingsDropdown() {
  const { theme, darkMode, setTheme, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themes = [
    { id: 'soft' as Theme, name: t('theme.soft'), icon: '💙' },
    { id: 'corporate' as Theme, name: t('theme.corporate'), icon: '🔵' },
    { id: 'medical' as Theme, name: t('theme.medical'), icon: '💚' }
  ];

  const languages = [
    { id: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { id: 'en' as Language, name: 'English', flag: '🇬🇧' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))] transition-colors">
        <span className="text-xl">⚙️</span>
        <span className="hidden md:inline text-sm font-medium">{t('settings.title')}</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-[rgb(var(--card))] border-[rgb(var(--border))]">
        {/* Tema del Sistema */}
        <DropdownMenuLabel className="text-[rgb(var(--foreground))]">
          🎨 {t('settings.theme')}
        </DropdownMenuLabel>
        <div className="px-2 py-2 space-y-1">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md
                transition-all duration-200 text-sm
                ${theme === t.id
                  ? 'bg-[rgb(var(--primary))] text-white'
                  : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
                }
              `}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="font-medium">{t.name}</span>
            </button>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Modo Claro/Oscuro */}
        <DropdownMenuLabel className="text-[rgb(var(--foreground))]">
          🌓 {t('theme.changeMode')}
        </DropdownMenuLabel>
        <div className="px-2 py-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-[rgb(var(--gray-very-light))] hover:bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--foreground))] transition-colors text-sm"
          >
            <span className="text-lg">{darkMode === 'light' ? '🌙' : '☀️'}</span>
            <span className="font-medium">
              {darkMode === 'light' ? t('theme.darkMode') : t('theme.lightMode')}
            </span>
          </button>
        </div>

        <DropdownMenuSeparator className="bg-[rgb(var(--border))]" />

        {/* Idioma */}
        <DropdownMenuLabel className="text-[rgb(var(--foreground))]">
          🌐 {t('settings.language')}
        </DropdownMenuLabel>
        <div className="px-2 py-2 space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md
                transition-all duration-200 text-sm
                ${language === lang.id
                  ? 'bg-[rgb(var(--primary))] text-white'
                  : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
                }
              `}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}