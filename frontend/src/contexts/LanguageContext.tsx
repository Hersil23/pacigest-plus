"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

// Tipos de idiomas disponibles
export type Language = 'es' | 'en';

// Tipo para las traducciones
type Translations = typeof es;

// Interfaz del contexto
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Crear el contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones disponibles
const translations: Record<Language, Translations> = {
  es,
  en
};

// Provider del idioma
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  // Cargar idioma guardado al montar
  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('pacigest-language') as Language;
    if (savedLanguage && ['es', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Función para cambiar idioma
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('pacigest-language', newLanguage);
    
    // Actualizar atributo lang del HTML
    document.documentElement.lang = newLanguage;
  };

  // Función de traducción
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  // Evitar flash de contenido sin estilo
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personalizado para usar el idioma
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
}