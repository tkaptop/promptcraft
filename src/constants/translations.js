// 翻译配置 (Translations)
// 支持的语言: cn, en, ko, ja, es, de, fr, ru, ar, pt, it
// 拆分为: common, banks, templates, seo

// 默认预加载 cn/en 的 common（核心UI），其余按需 lazy-load
import cnCommon from '../locales/cn/common.json';
import enCommon from '../locales/en/common.json';

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

// 翻译数据缓存（cn/en common 预加载；其他按需加载）
export const TRANSLATIONS = {
  cn: { ...cnCommon },
  en: { ...enCommon },
};

// 模块加载状态跟踪
const loadedModules = {
  cn: { common: true, banks: false, templates: false, seo: false },
  en: { common: true, banks: false, templates: false, seo: false },
};

// 模块加载器
const MODULE_LOADERS = {
  cn: {
    banks: () => import('../locales/cn/banks.json').then(m => m.default),
    templates: () => import('../locales/cn/templates.json').then(m => m.default),
    seo: () => import('../locales/cn/seo.json').then(m => m.default),
  },
  en: {
    banks: () => import('../locales/en/banks.json').then(m => m.default),
    templates: () => import('../locales/en/templates.json').then(m => m.default),
    seo: () => import('../locales/en/seo.json').then(m => m.default),
  },
  ko: {
    common: () => import('../locales/ko/common.json').then(m => m.default),
    banks: () => import('../locales/ko/banks.json').then(m => m.default),
    templates: () => import('../locales/ko/templates.json').then(m => m.default),
    seo: () => import('../locales/ko/seo.json').then(m => m.default),
  },
  ja: {
    common: () => import('../locales/ja/common.json').then(m => m.default),
    banks: () => import('../locales/ja/banks.json').then(m => m.default),
    templates: () => import('../locales/ja/templates.json').then(m => m.default),
    seo: () => import('../locales/ja/seo.json').then(m => m.default),
  },
  es: {
    common: () => import('../locales/es/common.json').then(m => m.default),
    banks: () => import('../locales/es/banks.json').then(m => m.default),
    templates: () => import('../locales/es/templates.json').then(m => m.default),
    seo: () => import('../locales/es/seo.json').then(m => m.default),
  },
  de: {
    common: () => import('../locales/de/common.json').then(m => m.default),
    banks: () => import('../locales/de/banks.json').then(m => m.default),
    templates: () => import('../locales/de/templates.json').then(m => m.default),
    seo: () => import('../locales/de/seo.json').then(m => m.default),
  },
  fr: {
    common: () => import('../locales/fr/common.json').then(m => m.default),
    banks: () => import('../locales/fr/banks.json').then(m => m.default),
    templates: () => import('../locales/fr/templates.json').then(m => m.default),
    seo: () => import('../locales/fr/seo.json').then(m => m.default),
  },
  ru: {
    common: () => import('../locales/ru/common.json').then(m => m.default),
    banks: () => import('../locales/ru/banks.json').then(m => m.default),
    templates: () => import('../locales/ru/templates.json').then(m => m.default),
    seo: () => import('../locales/ru/seo.json').then(m => m.default),
  },
  ar: {
    common: () => import('../locales/ar/common.json').then(m => m.default),
    banks: () => import('../locales/ar/banks.json').then(m => m.default),
    templates: () => import('../locales/ar/templates.json').then(m => m.default),
    seo: () => import('../locales/ar/seo.json').then(m => m.default),
  },
  pt: {
    common: () => import('../locales/pt/common.json').then(m => m.default),
    banks: () => import('../locales/pt/banks.json').then(m => m.default),
    templates: () => import('../locales/pt/templates.json').then(m => m.default),
    seo: () => import('../locales/pt/seo.json').then(m => m.default),
  },
  it: {
    common: () => import('../locales/it/common.json').then(m => m.default),
    banks: () => import('../locales/it/banks.json').then(m => m.default),
    templates: () => import('../locales/it/templates.json').then(m => m.default),
    seo: () => import('../locales/it/seo.json').then(m => m.default),
  },
};

/**
 * 加载指定语言的特定模块
 * @param {string} lang - 语言代码
 * @param {string} module - 模块名 (common, banks, templates, seo)
 */
export const loadModule = async (lang, module) => {
  const normalizedLang = (lang || 'en').toLowerCase();
  
  // 检查是否已加载
  if (loadedModules[normalizedLang]?.[module]) {
    return TRANSLATIONS[normalizedLang];
  }
  
  const loader = MODULE_LOADERS[normalizedLang]?.[module];
  if (!loader) return null;
  
  try {
    const data = await loader();
    // 初始化语言对象
    if (!TRANSLATIONS[normalizedLang]) {
      TRANSLATIONS[normalizedLang] = {};
    }
    if (!loadedModules[normalizedLang]) {
      loadedModules[normalizedLang] = {};
    }
    // 合并数据
    Object.assign(TRANSLATIONS[normalizedLang], data);
    loadedModules[normalizedLang][module] = true;
    return TRANSLATIONS[normalizedLang];
  } catch (e) {
    console.warn(`[i18n] Failed to load ${module} for ${normalizedLang}`, e);
    return null;
  }
};

/**
 * 确保指定语言的翻译已加载（加载所有模块）
 * @returns {Promise<object|null>} 已加载的翻译对象（失败返回 null）
 */
export const ensureTranslations = async (language) => {
  const lang = (language || 'en').toLowerCase();
  
  // 加载所有模块
  const modules = ['common', 'banks', 'templates', 'seo'];
  await Promise.all(modules.map(m => loadModule(lang, m)));
  
  return TRANSLATIONS[lang] || null;
};

/**
 * 确保SEO模块已加载（用于SEO组件）
 */
export const ensureSEO = async (language) => {
  const lang = (language || 'en').toLowerCase();
  await loadModule(lang, 'seo');
  return TRANSLATIONS[lang];
};

/**
 * 确保Banks模块已加载（用于词库相关组件）
 */
export const ensureBanks = async (language) => {
  const lang = (language || 'en').toLowerCase();
  await loadModule(lang, 'banks');
  return TRANSLATIONS[lang];
};

/**
 * 确保Templates模块已加载（用于模板相关组件）
 */
export const ensureTemplates = async (language) => {
  const lang = (language || 'en').toLowerCase();
  await loadModule(lang, 'templates');
  return TRANSLATIONS[lang];
};

// 获取翻译文本，如果当前语言没有则回退到英文
export const getTranslation = (language, key, params = {}) => {
  const lang = (language || 'en').toLowerCase();
  let str = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;

  // 替换所有 {{param}} 占位符（同一参数可能出现多次）
  for (const k of Object.keys(params)) {
    str = str.split(`{{${k}}}`).join(String(params[k]));
  }

  return str;
};
