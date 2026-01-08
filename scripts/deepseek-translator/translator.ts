#!/usr/bin/env tsx
/**
 * DeepSeek i18n 翻译工具 - 通用版本
 *
 * 可用于任何项目的多语言 JSON 文件翻译
 *
 * @author Claude Code
 * @version 2.0.0
 */

import fs from 'fs/promises';
import path from 'path';

// ==================== 类型定义 ====================

interface TranslatorConfig {
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  i18nDir?: string;
  skipKeys?: string[];
  languages?: Record<string, string>;
  force?: boolean; // 是否强制覆盖已翻译的内容
}

interface TranslationItem {
  path: string;
  text: string;
  context: string;
}

// ==================== 默认配置 ====================

const DEFAULT_CONFIG: Required<Omit<TranslatorConfig, 'apiKey'>> = {
  apiUrl: 'https://api.deepseek.com/chat/completions',
  model: 'deepseek-chat',
  temperature: 1.3,
  batchSize: 50, // 优化：DeepSeek API 无固定限流，提升至50
  maxRetries: 3,
  retryDelay: 1000,
  i18nDir: './src/i18n',
  skipKeys: [
    'url',
    'src',
    'icon',
    'target',
    'srcLight',
    'srcDark',
    'alt',
    'href',
    'link',
    // non-translatable data fields
    'email',
    'ein',
    'address',
    'state',
    'phone',
  ],
  force: false, // 默认跳过已翻译的内容
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
  },
};

// ==================== 配置加载 ====================

/**
 * 加载配置文件（如果存在）
 */
async function loadConfigFile(configPath?: string): Promise<Partial<TranslatorConfig>> {
  const possiblePaths = configPath
    ? [configPath]
    : [
        '.translator.config.js',
        '.translator.config.json',
        'translator.config.js',
        'translator.config.json',
      ];

  for (const filePath of possiblePaths) {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      await fs.access(fullPath);

      if (filePath.endsWith('.json')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(content);
      } else {
        // 动态导入 .js 配置文件
        const config = await import(fullPath);
        return config.default || config;
      }
    } catch {
      // 继续尝试下一个路径
    }
  }

  return {};
}

/**
 * 合并配置
 */
function mergeConfig(
  fileConfig: Partial<TranslatorConfig>,
  cliConfig: Partial<TranslatorConfig>
): Required<TranslatorConfig> {
  const apiKey =
    cliConfig.apiKey ||
    fileConfig.apiKey ||
    process.env.DEEPSEEK_API_KEY ||
    '';

  // 只合并非 undefined 的值
  const cleanCliConfig = Object.fromEntries(
    Object.entries(cliConfig).filter(([_, v]) => v !== undefined)
  );
  const cleanFileConfig = Object.fromEntries(
    Object.entries(fileConfig).filter(([_, v]) => v !== undefined)
  );

  return {
    ...DEFAULT_CONFIG,
    ...cleanFileConfig,
    ...cleanCliConfig,
    apiKey,
  };
}

// ==================== 翻译逻辑 ====================

class DeepSeekTranslator {
  private config: Required<TranslatorConfig>;

  constructor(config: Required<TranslatorConfig>) {
    this.config = config;
  }

  /**
   * 判断文本是否为“非语言内容”，例如纯数字 ID、邮箱、URL 等
   * 这类内容不需要走翻译模型，避免模型“多嘴”加解释说明
   */
  private isNonLinguisticText(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) return false;

    // 纯数字 + 连字符
    if (/^[0-9\-\s]+$/.test(trimmed)) return true;

    // 纯邮箱
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return true;

    // URL
    if (/^(https?:\/\/|www\.)/i.test(trimmed)) return true;

    return false;
  }

  /**
   * 清理模型输出中意外添加的说明文字 / 注释
   * 例如以 "Note:"、"**Note:**" 开头的解释段
   */
  private cleanTranslation(output: string): string {
    let cleaned = output.trim();

    const patterns: RegExp[] = [
      /\n+\s*\(?Note[:：]/i,
      /\n+\s*\*\*Note\*\*[:：]/i,
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && typeof match.index === 'number') {
        cleaned = cleaned.slice(0, match.index).trim();
      }
    }

    // 结尾形如 "(Note: ...)" 的注释
    cleaned = cleaned.replace(/\(\s*Note[:：][^)]*\)\s*$/i, '').trim();

    return cleaned;
  }

  /**
   * 获取系统提示词
   */
  private getSystemPrompt(targetLang: string): string {
    const langName = this.config.languages[targetLang] || targetLang;

    return `You are a professional translator specializing in localization and natural language adaptation.

Your task is to translate content into ${langName} (${targetLang}) with the following requirements:

1. **Localization**: Adapt the content to local culture and customs, not just literal translation
2. **Natural Language**: Use expressions that native speakers would naturally use
3. **Tone Preservation**: Maintain the original tone (formal/casual, technical/marketing)
4. **Context Awareness**: Consider the context and purpose of the text
5. **Cultural Sensitivity**: Be aware of cultural differences and adapt accordingly
6. **Technical Terms**: Keep technical terms consistent, use commonly accepted translations
7. **Brand Names**: NEVER translate these brand/product names - keep exact English spelling:
   - Gempix2, Nano Banana 2, Nano Banana 2, Nano Banana
   - GPT-4o, OpenAI, ChatGPT
   - Veo 3, Veo 3.1, Sora 2
   - Flux, Fal.ai
   - Google, GitHub, Stripe, Cloudflare, Supabase, Resend

Output ONLY the translated text, without any explanations or additional comments.`;
  }

  /**
   * 获取用户提示词
   */
  private getUserPrompt(text: string, targetLang: string, context?: string): string {
    const langName = this.config.languages[targetLang] || targetLang;

    let prompt = `Translate the following text to ${langName} (${targetLang}).\n`;

    if (context) {
      prompt += `\nContext: ${context}\n`;
    }

    prompt += `\nText to translate:\n${text}`;

    return prompt;
  }

  /**
   * 调用 DeepSeek API
   */
  private async callAPI(text: string, targetLang: string, context?: string): Promise<string> {
    // 对于纯 ID / 邮箱 / URL 等非语言文本，直接原样返回，避免模型加入解释
    if (this.isNonLinguisticText(text)) {
      return text;
    }

    if (!this.config.apiKey) {
      throw new Error('API Key is required. Set DEEPSEEK_API_KEY or provide it in config.');
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(targetLang),
          },
          {
            role: 'user',
            content: this.getUserPrompt(text, targetLang, context),
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content ?? '';
    const translatedText = this.cleanTranslation(rawText);

    if (!translatedText) {
      throw new Error('No translation returned from API');
    }

    return translatedText;
  }

  /**
   * 带重试的翻译
   */
  async translateWithRetry(text: string, targetLang: string, context?: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.callAPI(text, targetLang, context);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`  ❌ Attempt ${attempt}/${this.config.maxRetries} failed:`, error);

        if (attempt < this.config.maxRetries) {
          const waitTime = this.config.retryDelay * attempt;
          console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        }
      }
    }

    throw new Error(`Translation failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 判断是否应跳过该键
   */
  private shouldSkipKey(key: string): boolean {
    return this.config.skipKeys.includes(key);
  }

  /**
   * 判断是否为可翻译的值
   */
  private isTranslatableValue(value: any): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * 递归收集需要翻译的文本
   */
  collectTranslatableTexts(
    obj: any,
    currentPath: string = '',
    collected: TranslationItem[] = []
  ): TranslationItem[] {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const itemPath = `${currentPath}[${index}]`;
        this.collectTranslatableTexts(item, itemPath, collected);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (this.shouldSkipKey(key)) {
          return;
        }

        if (this.isTranslatableValue(value)) {
          const context = key.replace(/_/g, ' ');
          collected.push({ path: newPath, text: value, context });
        } else if (typeof value === 'object') {
          this.collectTranslatableTexts(value, newPath, collected);
        }
      });
    }

    return collected;
  }

  /**
   * 根据路径设置值
   */
  setValueByPath(obj: any, path: string, value: string): void {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const isArrayIndex = /^\d+$/.test(nextPart);

      if (!(part in current)) {
        current[part] = isArrayIndex ? [] : {};
      }

      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  /**
   * 根据路径获取值
   */
  getValueByPath(obj: any, path: string): any {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * 批量翻译（并发优化版）
   */
  async translateBatch(
    batch: TranslationItem[],
    targetLang: string,
    batchIndex: number,
    totalBatches: number
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    console.log(`\n📦 Batch ${batchIndex}/${totalBatches} (${batch.length} items) - 并发处理中...`);

    // 使用 Promise.all 并发翻译所有项目
    const promises = batch.map(async (item) => {
      try {
        const translated = await this.translateWithRetry(item.text, targetLang, item.context);
        return { path: item.path, text: translated, success: true };
      } catch (error) {
        console.error(`  ❌ Failed to translate ${item.path}:`, error);
        return { path: item.path, text: item.text, success: false };
      }
    });

    // 等待所有翻译完成
    const batchResults = await Promise.all(promises);

    // 收集结果
    let successCount = 0;
    for (const result of batchResults) {
      results.set(result.path, result.text);
      if (result.success) successCount++;
    }

    console.log(`  ✅ 完成 ${successCount}/${batch.length} 项翻译`);

    // 批次之间稍微延迟，避免过载（优化：从100ms降至10ms）
    await this.delay(10);

    return results;
  }

  /**
   * 翻译整个文件
   */
  async translateFile(
    sourceFile: string,
    sourceLang: string,
    targetLang: string
  ): Promise<any> {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Translating: ${sourceFile}`);
    console.log(`   From: ${this.config.languages[sourceLang]} (${sourceLang})`);
    console.log(`   To:   ${this.config.languages[targetLang]} (${targetLang})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const sourceContent = await fs.readFile(sourceFile, 'utf-8');
    const sourceData = JSON.parse(sourceContent);

    // 尝试读取已存在的目标文件
    const targetFile = sourceFile.replace(`/${sourceLang}.json`, `/${targetLang}.json`);
    let existingTarget: any = {};
    try {
      const existingContent = await fs.readFile(targetFile, 'utf-8');
      existingTarget = JSON.parse(existingContent);
      if (!this.config.force) {
        console.log(`   ℹ️  Found existing target file, will skip already translated content`);
        console.log(`   💡 Use --force to override existing translations`);
      }
    } catch (error) {
      // 目标文件不存在，继续
    }

    console.log('\n🔍 Collecting translatable texts...');
    const allTexts = this.collectTranslatableTexts(sourceData);

    // 如果不是强制模式，过滤掉已翻译的内容
    let textsToTranslate = allTexts;
    if (!this.config.force && Object.keys(existingTarget).length > 0) {
      textsToTranslate = allTexts.filter(item => {
        const existingValue = this.getValueByPath(existingTarget, item.path);
        return !existingValue || typeof existingValue !== 'string' || existingValue.trim() === '';
      });

      const skippedCount = allTexts.length - textsToTranslate.length;
      console.log(`   Found ${allTexts.length} texts total`);
      console.log(`   ⏭️  Skipped ${skippedCount} already translated`);
      console.log(`   📝 Need to translate ${textsToTranslate.length} texts`);
    } else {
      console.log(`   Found ${textsToTranslate.length} texts to translate`);
    }

    if (textsToTranslate.length === 0) {
      console.log('   ⚠️  No texts to translate, skipping...');
      return Object.keys(existingTarget).length > 0 ? existingTarget : sourceData;
    }

    // 从现有翻译或源数据开始
    const result = Object.keys(existingTarget).length > 0
      ? JSON.parse(JSON.stringify(existingTarget))
      : JSON.parse(JSON.stringify(sourceData));

    const batches: TranslationItem[][] = [];
    for (let i = 0; i < textsToTranslate.length; i += this.config.batchSize) {
      batches.push(textsToTranslate.slice(i, i + this.config.batchSize));
    }

    console.log(`\n📊 Total batches: ${batches.length} (batch size: ${this.config.batchSize})`);

    for (let i = 0; i < batches.length; i++) {
      const translatedBatch = await this.translateBatch(
        batches[i],
        targetLang,
        i + 1,
        batches.length
      );

      for (const [path, translatedText] of translatedBatch) {
        this.setValueByPath(result, path, translatedText);
      }
    }

    console.log('\n✅ Translation completed!');
    return result;
  }
}

// ==================== CLI ====================

async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  const flags: Record<string, string> = {};
  const positionalArgs: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      flags[key] = value;
      if (value !== 'true') i++;
    } else {
      positionalArgs.push(arg);
    }
  }

  // 显示帮助
  if (flags.help || positionalArgs.length < 3) {
    console.log(`
DeepSeek i18n Translator - Universal Translation Tool

Usage:
  tsx deepseek-translator.ts <source-lang> <target-lang> <file-path> [options]

Arguments:
  source-lang    Source language code (e.g., en)
  target-lang    Target language code (e.g., zh, ja, ko)
  file-path      Path to the JSON file to translate

Options:
  --dir <path>           i18n directory (default: ./src/i18n)
  --config <path>        Config file path (default: .translator.config.js)
  --api-key <key>        DeepSeek API key (or set DEEPSEEK_API_KEY env)
  --temperature <num>    Temperature setting (default: 1.3)
  --batch-size <num>     Batch size (default: 50)
  --force                Force overwrite existing translations (default: false)
  --help                 Show this help message

Examples:
  # Basic usage
  tsx deepseek-translator.ts en zh landing.json

  # Specify custom i18n directory
  tsx deepseek-translator.ts en ja landing.json --dir ./locales

  # With custom config
  tsx deepseek-translator.ts en ko landing.json --config ./my-config.js

  # Override API key
  tsx deepseek-translator.ts en fr landing.json --api-key sk-xxx

Supported Languages:
  en, zh, ja, ko, es, fr, de, it, pt, ru, ar

For more info: https://api-docs.deepseek.com/zh-cn/
`);
    process.exit(flags.help ? 0 : 1);
  }

  const [sourceLang, targetLang, filePathArg] = positionalArgs;

  // 加载配置
  const fileConfig = await loadConfigFile(flags.config);
  const cliConfig: Partial<TranslatorConfig> = {
    i18nDir: flags.dir,
    apiKey: flags['api-key'],
    temperature: flags.temperature ? parseFloat(flags.temperature) : undefined,
    batchSize: flags['batch-size'] ? parseInt(flags['batch-size']) : undefined,
    force: flags.force === 'true',
  };

  const config = mergeConfig(fileConfig, cliConfig);

  // 验证配置
  if (!config.apiKey) {
    console.error('❌ API Key is required!');
    console.error('   Set DEEPSEEK_API_KEY environment variable, or');
    console.error('   Use --api-key flag, or');
    console.error('   Add it to .translator.config.js');
    console.error('\n   Get your key: https://platform.deepseek.com/api_keys');
    process.exit(1);
  }

  if (!config.languages[sourceLang]) {
    console.error(`❌ Invalid source language: ${sourceLang}`);
    console.error(`   Supported: ${Object.keys(config.languages).join(', ')}`);
    process.exit(1);
  }

  if (!config.languages[targetLang]) {
    console.error(`❌ Invalid target language: ${targetLang}`);
    console.error(`   Supported: ${Object.keys(config.languages).join(', ')}`);
    process.exit(1);
  }

  // 构建文件路径
  const i18nDir = path.resolve(process.cwd(), config.i18nDir);
  const sourceFile = path.join(i18nDir, filePathArg);
  const targetFile = path.join(
    i18nDir,
    filePathArg.replace(new RegExp(`${sourceLang}\\.json$`), `${targetLang}.json`)
  );

  // 检查源文件
  try {
    await fs.access(sourceFile);
  } catch {
    console.error(`❌ Source file not found: ${sourceFile}`);
    console.error(`   i18n directory: ${i18nDir}`);
    console.error(`   Use --dir to specify a different directory`);
    process.exit(1);
  }

  // 执行翻译
  try {
    const translator = new DeepSeekTranslator(config);
    const translatedData = await translator.translateFile(sourceFile, sourceLang, targetLang);

    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, JSON.stringify(translatedData, null, 2) + '\n', 'utf-8');

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Success!`);
    console.log(`   Saved to: ${targetFile}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } catch (error) {
    console.error('\n❌ Translation failed:', error);
    process.exit(1);
  }
}

// 运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DeepSeekTranslator, type TranslatorConfig };
