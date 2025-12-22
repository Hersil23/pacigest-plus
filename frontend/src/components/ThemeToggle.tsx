"use client";

import { useTheme, Theme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, darkMode, setTheme, toggleDarkMode } = useTheme();

  const themes = [
    { id: 'soft' as Theme, name: 'Soft', icon: '💙' },
    { id: 'corporate' as Theme, name: 'Corporate', icon: '🔵' },
    { id: 'medical' as Theme, name: 'Medical', icon: '💚' }
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Selector de Tema */}
      <div className="flex items-center gap-2">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-200
              ${theme === t.id 
                ? 'bg-[rgb(var(--primary))] text-white shadow-md' 
                : 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))]'
              }
            `}
            title={`Cambiar a tema ${t.name}`}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="text-sm font-medium hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Divisor */}
      <div className="h-8 w-px bg-[rgb(var(--border))]"></div>

      {/* Toggle Modo Oscuro */}
      <button
        onClick={toggleDarkMode}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[rgb(var(--card))] text-[rgb(var(--foreground))]
          hover:bg-[rgb(var(--gray-very-light))]
          border border-[rgb(var(--border))]
          transition-all duration-200
        "
        title={darkMode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        <span className="text-lg">{darkMode === 'light' ? '🌙' : '☀️'}</span>
        <span className="text-sm font-medium hidden sm:inline">
          {darkMode === 'light' ? 'Oscuro' : 'Claro'}
        </span>
      </button>
    </div>
  );
}