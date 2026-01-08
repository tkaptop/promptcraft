#!/usr/bin/env tsx
/**
 * i18n 翻译工具 - 使用 DeepSeek API
 *
 * 功能：
 * - 递归翻译嵌套 JSON 结构
 * - 批量处理优化 API 调用
 * - 自动重试和错误处理
 * - 进度显示
 * - 支持多种语言
 */

import fs from 'fs/promises';
import path from 'path';

// ==================== 配置 ====================

const CONFIG = {
  // DeepSeek API 配置
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  apiUrl: 'https://api.deepseek.com/chat/completions',
  model: 'deepseek-chat',
  temperature: 1.3, // 官方推荐翻译场景值

  // 翻译配置
  batchSize: 5, // 每批翻译的文本数量
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）

  // 路径配置
  i18nDir: path.join(process.cwd(), 'src/i18n'),
};

// ==================== 语言配置 ====================

const LANGUAGES = {
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
};

// 语言特定的系统提示词
const getSystemPrompt = (targetLang: string): string => {
  const langName = LANGUAGES[targetLang as keyof typeof LANGUAGES] || targetLang;

  return `You are a professional translator specializing in localization and natural language adaptation.

Your task is to translate content into ${langName} (${targetLang}) with the following requirements:

1. **Localization**: Adapt the content to local culture and customs, not just literal translation
2. **Natural Language**: Use expressions that native speakers would naturally use
3. **Tone Preservation**: Maintain the original tone (formal/casual, technical/marketing)
4. **Context Awareness**: Consider the context and purpose of the text
5. **Cultural Sensitivity**: Be aware of cultural differences and adapt accordingly
6. **Technical Terms**: Keep technical terms consistent, use commonly accepted translations
7. **Brand Names**: Preserve brand names and proper nouns unless local variants exist

Output ONLY the translated text, without any explanations or additional comments.`;
};

// 用户提示词模板
const getUserPrompt = (text: string, targetLang: string, context?: string): string => {
  const langName = LANGUAGES[targetLang as keyof typeof LANGUAGES] || targetLang;

  let prompt = `Translate the following text to ${langName} (${targetLang}).\n`;

  if (context) {
    prompt += `\nContext: ${context}\n`;
  }

  prompt += `\nText to translate:\n${text}`;

  return prompt;
};

// ==================== 工具函数 ====================

/**
 * 延迟函数
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 调用 DeepSeek API
 */
async function callDeepSeekAPI(
  text: string,
  targetLang: string,
  context?: string
): Promise<string> {
  if (!CONFIG.apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  }

  const response = await fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      temperature: CONFIG.temperature,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(targetLang),
        },
        {
          role: 'user',
          content: getUserPrompt(text, targetLang, context),
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
  const translatedText = data.choices?.[0]?.message?.content?.trim();

  if (!translatedText) {
    throw new Error('No translation returned from API');
  }

  return translatedText;
}

/**
 * 带重试的翻译函数
 */
async function translateWithRetry(
  text: string,
  targetLang: string,
  context?: string
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const result = await callDeepSeekAPI(text, targetLang, context);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`  ❌ Attempt ${attempt}/${CONFIG.maxRetries} failed:`, error);

      if (attempt < CONFIG.maxRetries) {
        const waitTime = CONFIG.retryDelay * attempt;
        console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
  }

  throw new Error(`Translation failed after ${CONFIG.maxRetries} attempts: ${lastError?.message}`);
}

/**
 * 判断是否为需要翻译的文本值
 */
function isTranslatableValue(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * 判断是否为跳过的键（URL、路径等）
 */
function shouldSkipKey(key: string): boolean {
  const skipKeys = ['url', 'src', 'icon', 'target', 'srcLight', 'srcDark', 'alt'];
  return skipKeys.includes(key);
}

/**
 * 递归收集所有需要翻译的文本
 */
function collectTranslatableTexts(
  obj: any,
  currentPath: string = '',
  collected: Array<{ path: string; text: string; context: string }> = []
): Array<{ path: string; text: string; context: string }> {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const itemPath = `${currentPath}[${index}]`;
      collectTranslatableTexts(item, itemPath, collected);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (shouldSkipKey(key)) {
        // 跳过不需要翻译的字段
        return;
      }

      if (isTranslatableValue(value)) {
        // 收集需要翻译的文本
        const context = key.replace(/_/g, ' '); // 使用键名作为上下文
        collected.push({ path: newPath, text: value, context });
      } else if (typeof value === 'object') {
        collectTranslatableTexts(value, newPath, collected);
      }
    });
  }

  return collected;
}

/**
 * 根据路径设置值
 */
function setValueByPath(obj: any, path: string, value: string): void {
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
 * 批量翻译文本
 */
async function translateBatch(
  batch: Array<{ path: string; text: string; context: string }>,
  targetLang: string,
  batchIndex: number,
  totalBatches: number
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  console.log(`\n📦 Batch ${batchIndex}/${totalBatches} (${batch.length} items)`);

  for (const item of batch) {
    try {
      console.log(`  🔄 Translating: ${item.path.substring(0, 50)}...`);
      const translated = await translateWithRetry(item.text, targetLang, item.context);
      results.set(item.path, translated);
      console.log(`  ✅ Done`);

      // 避免触发速率限制
      await delay(200);
    } catch (error) {
      console.error(`  ❌ Failed to translate ${item.path}:`, error);
      // 失败时保留原文
      results.set(item.path, item.text);
    }
  }

  return results;
}

/**
 * 翻译整个 JSON 文件
 */
async function translateFile(
  sourceFile: string,
  sourceLang: string,
  targetLang: string
): Promise<any> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📝 Translating: ${sourceFile}`);
  console.log(`   From: ${LANGUAGES[sourceLang as keyof typeof LANGUAGES]} (${sourceLang})`);
  console.log(`   To:   ${LANGUAGES[targetLang as keyof typeof LANGUAGES]} (${targetLang})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // 读取源文件
  const sourceContent = await fs.readFile(sourceFile, 'utf-8');
  const sourceData = JSON.parse(sourceContent);

  // 收集所有需要翻译的文本
  console.log('\n🔍 Collecting translatable texts...');
  const textsToTranslate = collectTranslatableTexts(sourceData);
  console.log(`   Found ${textsToTranslate.length} texts to translate`);

  if (textsToTranslate.length === 0) {
    console.log('   ⚠️  No texts to translate, skipping...');
    return sourceData;
  }

  // 创建结果对象（深拷贝）
  const result = JSON.parse(JSON.stringify(sourceData));

  // 分批翻译
  const batches: Array<Array<{ path: string; text: string; context: string }>> = [];
  for (let i = 0; i < textsToTranslate.length; i += CONFIG.batchSize) {
    batches.push(textsToTranslate.slice(i, i + CONFIG.batchSize));
  }

  console.log(`\n📊 Total batches: ${batches.length} (batch size: ${CONFIG.batchSize})`);

  // 翻译每个批次
  for (let i = 0; i < batches.length; i++) {
    const translatedBatch = await translateBatch(
      batches[i],
      targetLang,
      i + 1,
      batches.length
    );

    // 应用翻译结果
    for (const [path, translatedText] of translatedBatch) {
      setValueByPath(result, path, translatedText);
    }
  }

  console.log('\n✅ Translation completed!');
  return result;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
Usage: tsx scripts/translate-i18n.ts <source-lang> <target-lang> <file-path>

Arguments:
  source-lang  Source language code (e.g., en)
  target-lang  Target language code (e.g., zh, ja, ko, etc.)
  file-path    Relative path to the i18n file (e.g., pages/landing/en.json)

Supported languages:
${Object.entries(LANGUAGES)
  .map(([code, name]) => `  ${code.padEnd(4)} - ${name}`)
  .join('\n')}

Examples:
  # Translate landing page from English to Chinese
  tsx scripts/translate-i18n.ts en zh pages/landing/en.json

  # Translate messages from English to Japanese
  tsx scripts/translate-i18n.ts en ja messages/en.json

Environment:
  DEEPSEEK_API_KEY  Your DeepSeek API key (required)
`);
    process.exit(1);
  }

  const [sourceLang, targetLang, filePath] = args;

  // 验证语言代码
  if (!LANGUAGES[sourceLang as keyof typeof LANGUAGES]) {
    console.error(`❌ Invalid source language: ${sourceLang}`);
    process.exit(1);
  }

  if (!LANGUAGES[targetLang as keyof typeof LANGUAGES]) {
    console.error(`❌ Invalid target language: ${targetLang}`);
    process.exit(1);
  }

  // 验证 API Key
  if (!CONFIG.apiKey) {
    console.error('❌ DEEPSEEK_API_KEY environment variable is not set');
    console.error('   Get your API key from: https://platform.deepseek.com/api_keys');
    process.exit(1);
  }

  // 构建文件路径
  const sourceFile = path.join(CONFIG.i18nDir, filePath);
  const targetFile = path.join(
    CONFIG.i18nDir,
    filePath.replace(sourceLang, targetLang)
  );

  try {
    // 检查源文件是否存在
    await fs.access(sourceFile);
  } catch {
    console.error(`❌ Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  try {
    // 执行翻译
    const translatedData = await translateFile(sourceFile, sourceLang, targetLang);

    // 确保目标目录存在
    await fs.mkdir(path.dirname(targetFile), { recursive: true });

    // 写入翻译结果
    await fs.writeFile(
      targetFile,
      JSON.stringify(translatedData, null, 2) + '\n',
      'utf-8'
    );

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Success!`);
    console.log(`   Saved to: ${targetFile}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } catch (error) {
    console.error('\n❌ Translation failed:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);
