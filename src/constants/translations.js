// 翻译配置 (Translations)
// 支持的语言: cn, en, ko, ja, es, de, fr, ru, ar, pt, it

// 导入翻译文件
import cn from '../locales/cn.json';
import en from '../locales/en.json';
import ko from '../locales/ko.json';
import ja from '../locales/ja.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import ru from '../locales/ru.json';
import ar from '../locales/ar.json';
import pt from '../locales/pt.json';
import it from '../locales/it.json';

// 语言配置
export const SUPPORTED_LANGUAGES = {
  cn: { name: '中文', nativeName: '中文' },
  en: { name: 'English', nativeName: 'English' },
  ko: { name: 'Korean', nativeName: '한국어' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  es: { name: 'Spanish', nativeName: 'Español' },
  de: { name: 'German', nativeName: 'Deutsch' },
  fr: { name: 'French', nativeName: 'Français' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  it: { name: 'Italian', nativeName: 'Italiano' },
};

// 语言代码列表
export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES);

// 翻译数据
export const TRANSLATIONS = {
  cn,
  en,
  ko,
  ja,
  es,
  de,
  fr,
  ru,
  ar,
  pt,
  it,
};

// 获取翻译文本，如果当前语言没有则回退到英文
export const getTranslation = (language, key, params = {}) => {
  let str = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  Object.keys(params).forEach(k => {
    str = str.replace(`{{${k}}}`, params[k]);
  });
  return str;
};
