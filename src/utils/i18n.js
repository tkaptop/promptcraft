// i18n 工具函数 - 封装翻译逻辑
import { TRANSLATIONS } from '../constants/translations';

/**
 * 获取本地化文本
 * 支持两种模式：
 * 1. 传统模式：obj 是 {cn: "中文", en: "English"} 格式
 * 2. 翻译键模式：obj 是 {_key: "bank_role_label"} 格式，从 translations 中查找
 */
export const getLocalized = (obj, language) => {
  if (!obj) return "";
  if (typeof obj === 'string') return obj;

  // 如果有 _key 属性，从 TRANSLATIONS 中查找
  if (obj._key) {
    const translated = TRANSLATIONS[language]?.[obj._key] || TRANSLATIONS.en?.[obj._key];
    if (translated) return translated;
  }

  // 传统模式：直接从对象中获取对应语言的值
  return obj[language] || obj.cn || obj.en || "";
};

/**
 * 获取 bank label 的本地化文本
 * @param {string} bankId - 词库 ID (如 "role")
 * @param {object} bankData - 词库数据对象 (包含 label 属性)
 * @param {string} language - 当前语言
 */
export const getBankLabel = (bankId, bankData, language) => {
  if (!bankData?.label) return bankId;

  // 优先从 TRANSLATIONS 中查找
  const key = `bank_${bankId}_label`;
  const translated = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key];
  if (translated) return translated;

  // 回退到传统模式
  return getLocalized(bankData.label, language);
};

/**
 * 获取 bank option 的本地化文本
 * @param {string} bankId - 词库 ID (如 "role")
 * @param {number} optionIndex - 选项索引
 * @param {string|object} optionData - 选项数据 (可能是字符串或 {cn, en} 对象)
 * @param {string} language - 当前语言
 */
export const getBankOption = (bankId, optionIndex, optionData, language) => {
  if (!optionData) return "";

  // 优先从 TRANSLATIONS 中查找
  const key = `bank_${bankId}_opt_${optionIndex}`;
  const translated = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key];
  if (translated) return translated;

  // 回退到传统模式
  return getLocalized(optionData, language);
};

/**
 * 获取 template name 的本地化文本
 * @param {string} templateId - 模版 ID (如 "tpl_default")
 * @param {object} templateData - 模版数据对象 (包含 name 属性)
 * @param {string} language - 当前语言
 */
export const getTemplateName = (templateId, templateData, language) => {
  if (!templateData?.name) return templateId;

  // 优先从 TRANSLATIONS 中查找
  const key = `tpl_${templateId}_name`;
  const translated = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key];
  if (translated) return translated;

  // 回退到传统模式
  return getLocalized(templateData.name, language);
};

/**
 * 获取 category label 的本地化文本
 * @param {string} categoryId - 分类 ID (如 "character")
 * @param {object} categoryData - 分类数据对象 (包含 label 属性)
 * @param {string} language - 当前语言
 */
export const getCategoryLabel = (categoryId, categoryData, language) => {
  if (!categoryData?.label) return categoryId;

  // 优先从 TRANSLATIONS 中查找
  const key = `cat_${categoryId}_label`;
  const translated = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key];
  if (translated) return translated;

  // 回退到传统模式
  return getLocalized(categoryData.label, language);
};

/**
 * 根据 bankId 和选项值查找选项索引
 * @param {object} bankData - 词库数据对象
 * @param {string|object} optionValue - 选项值
 * @param {string} language - 当前语言
 * @returns {number} 选项索引，未找到返回 -1
 */
export const findOptionIndex = (bankData, optionValue, language) => {
  if (!bankData?.options) return -1;

  const targetValue = typeof optionValue === 'string' ? optionValue : getLocalized(optionValue, language);

  return bankData.options.findIndex((opt, idx) => {
    const optValue = getLocalized(opt, language);
    return optValue === targetValue;
  });
};
