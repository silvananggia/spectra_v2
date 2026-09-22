import { useSelector } from 'react-redux';
import idTranslations from '../locales/id';
import enTranslations from '../locales/en';

const translations = {
  id: idTranslations,
  en: enTranslations,
};

/**
 * Custom hook to get translation function
 * @returns {Function} Translation function (key, defaultValue) => string
 */
export const useTranslation = () => {
  const currentLanguage = useSelector((state) => state.language?.currentLanguage || 'id');

  const t = (key, defaultValue = '') => {
    const keys = key.split('.');
    let value = translations[currentLanguage] || translations.id;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Indonesian if key not found
        value = translations.id;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return defaultValue || key;
          }
        }
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : (defaultValue || key);
  };

  return { t, currentLanguage };
};

/**
 * Utility function to get translation without hook (for use outside React components)
 * @param {string} language - Language code ('id' or 'en')
 * @param {string} key - Translation key (e.g., 'header.maps')
 * @param {string} defaultValue - Default value if key not found
 * @returns {string} Translated string
 */
export const translate = (language = 'id', key, defaultValue = '') => {
  const keys = key.split('.');
  let value = translations[language] || translations.id;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Indonesian if key not found
      value = translations.id;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return defaultValue || key;
        }
      }
      return defaultValue || key;
    }
  }

  return typeof value === 'string' ? value : (defaultValue || key);
};

