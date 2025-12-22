"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos de temas y modos disponibles
export type Theme = 'soft' | 'corporate' | 'medical';
export type DarkMode = 'light' | 'dark';

// Interfaz del contexto
interface ThemeContextType {
  theme: Theme;
  darkMode: DarkMode;
  setTheme: (theme: Theme) => void;
  setDarkMode: (mode: DarkMode) => void;
  toggleDarkMode: () => void;
}

// Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider del tema
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('soft');
  const [darkMode, setDarkModeState] = useState<DarkMode>('light');
  const [mounted, setMounted] = useState(false);

  // Cargar preferencias guardadas al montar
  useEffect(() => {
    setMounted(true);
    
    // Cargar tema
    const savedTheme = localStorage.getItem('pacigest-theme') as Theme;
    if (savedTheme && ['soft', 'corporate', 'medical'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    
    // Cargar modo oscuro
    const savedMode = localStorage.getItem('pacigest-darkmode') as DarkMode;
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      setDarkModeState(savedMode);
    }
    
    // Aplicar atributos
    applyTheme(savedTheme || 'soft', savedMode || 'light');
  }, []);

  // Función para aplicar tema y modo
  const applyTheme = (newTheme: Theme, newMode: DarkMode) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-mode', newMode);
  };

  // Función para cambiar tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('pacigest-theme', newTheme);
    applyTheme(newTheme, darkMode);
  };

  // Función para cambiar modo
  const setDarkMode = (newMode: DarkMode) => {
    setDarkModeState(newMode);
    localStorage.setItem('pacigest-darkmode', newMode);
    applyTheme(theme, newMode);
  };

  // Función para toggle rápido
  const toggleDarkMode = () => {
    const newMode = darkMode === 'light' ? 'dark' : 'light';
    setDarkMode(newMode);
  };

  // Evitar flash de contenido sin estilo
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setTheme, setDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}