"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SearchBar() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar búsqueda real con el backend
    console.log('Searching for:', searchQuery);
    if (searchQuery.trim()) {
      alert(`Buscando: "${searchQuery}" - Próximamente conectado al backend`);
    }
  };

  return (
    <>
      {/* Desktop Version - Always visible */}
      <form 
        onSubmit={handleSearch}
        className="hidden md:flex items-center gap-2 flex-1 max-w-md"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--gray-medium))] text-lg">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('header.search')}
            className="
              w-full pl-10 pr-4 py-2 rounded-lg
              bg-[rgb(var(--card))] text-[rgb(var(--foreground))]
              border border-[rgb(var(--border))]
              placeholder:text-[rgb(var(--gray-medium))]
              focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]
              transition-all
            "
          />
        </div>
      </form>

      {/* Mobile Version - Icon that opens search */}
      <div className="md:hidden">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))] border border-[rgb(var(--border))] transition-colors"
          >
            <span className="text-xl">🔍</span>
          </button>
        ) : (
          <div className="fixed inset-0 z-50 bg-[rgb(var(--background))] p-4">
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--gray-medium))] text-lg">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('header.search')}
                    autoFocus
                    className="
                      w-full pl-10 pr-4 py-3 rounded-lg
                      bg-[rgb(var(--card))] text-[rgb(var(--foreground))]
                      border border-[rgb(var(--border))]
                      placeholder:text-[rgb(var(--gray-medium))]
                      focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]
                      transition-all text-base
                    "
                  />
                </div>
              </form>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="px-4 py-3 rounded-lg bg-[rgb(var(--error))] text-white font-medium hover:opacity-90 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}