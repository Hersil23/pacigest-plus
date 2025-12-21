const es = require('./translations/es.json');
const en = require('./translations/en.json');

// Diccionario de traducciones
const translations = {
  es,
  en
};

// ============================================
// OBTENER VALOR DE OBJETO ANIDADO
// ============================================
// Ejemplo: get(obj, 'emails.verification.subject')
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// ============================================
// REEMPLAZAR VARIABLES EN TEXTO
// ============================================
// Ejemplo: replaceVars("Hola {name}!", { name: "Pedro" }) → "Hola Pedro!"
const replaceVars = (text, vars = {}) => {
  if (!text) return '';
  
  let result = text;
  Object.keys(vars).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, vars[key]);
  });
  
  return result;
};

// ============================================
// FUNCIÓN PRINCIPAL DE TRADUCCIÓN
// ============================================
const translate = (language = 'es') => {
  // Validar idioma, usar español por defecto
  const lang = ['es', 'en'].includes(language) ? language : 'es';
  const langTranslations = translations[lang];

  return (key, vars = {}) => {
    // Obtener traducción por clave
    const translation = getNestedValue(langTranslations, key);
    
    // Si no existe la traducción, devolver la clave
    if (!translation) {
      console.warn(`⚠️ Traducción no encontrada: ${key} [${lang}]`);
      return key;
    }
    
    // Reemplazar variables si existen
    return replaceVars(translation, vars);
  };
};

// ============================================
// HELPER: FORMATEAR FECHA SEGÚN IDIOMA
// ============================================
const formatDate = (date, language = 'es') => {
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  
  return new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ============================================
// EXPORTAR
// ============================================
module.exports = {
  translate,
  formatDate,
  translations
};