/**
 * DeepSeek Translator 配置文件示例
 *
 * 将此文件复制为 .translator.config.js 并根据需要修改
 */

export default {
  // DeepSeek API 配置
  // apiKey: process.env.DEEPSEEK_API_KEY, // 推荐使用环境变量
  // apiUrl: 'https://api.deepseek.com/chat/completions',
  // model: 'deepseek-chat',

  // 翻译参数
  temperature: 1.3, // 官方推荐翻译场景值

  // 批处理配置
  batchSize: 5, // 每批翻译的文本数量
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）

  // 项目路径
  i18nDir: './src/i18n', // i18n 文件目录

  // 跳过字段（这些字段不会被翻译）
  skipKeys: [
    'url',
    'href',
    'link',
    'src',
    'srcLight',
    'srcDark',
    'icon',
    'target',
    'alt',
    // 添加你的自定义跳过字段
  ],

  // 支持的语言（可以添加自定义语言）
  languages: {
    en: 'English',
    zh: '简体中文',
    ja: '日本語',
    ko: '한국어',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
    // 添加更多语言...
  },
};
