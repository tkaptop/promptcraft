/**
 * DeepSeek 翻译脚本 (优化版)
 * 使用批量翻译和并发处理加速翻译
 *
 * 使用方法:
 * DEEPSEEK_API_KEY=your_key node scripts/translate-deepseek.cjs [--locales] [--data]
 */

const fs = require('fs');
const path = require('path');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 并发配置
const BATCH_SIZE = 50; // 每批翻译的键数量
const CONCURRENCY = 9; // 同时翻译的语言数量（全部9个语言并发）

// 支持的语言
const SUPPORTED_LANGUAGES = {
  cn: { name: 'Chinese', nativeName: '简体中文' },
  en: { name: 'English', nativeName: 'English' },
  ko: { name: 'Korean', nativeName: '한국어' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  es: { name: 'Spanish', nativeName: 'Español' },
  de: { name: 'German', nativeName: 'Deutsch' },
  fr: { name: 'French', nativeName: 'Français' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  it: { name: 'Italian', nativeName: 'Italiano' }
};

// 目标语言（排除中英文源语言）
const TARGET_LANGUAGES = Object.keys(SUPPORTED_LANGUAGES).filter(l => l !== 'cn' && l !== 'en');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 批量翻译 - 一次 API 调用翻译多个文本
 */
async function translateBatch(texts, targetLang, context = '') {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }

  const langName = SUPPORTED_LANGUAGES[targetLang]?.name || targetLang;

  // 构建批量翻译的输入格式
  const inputJson = JSON.stringify(texts, null, 2);

  const systemPrompt = `You are a professional translator. Translate the given JSON array of texts to ${langName}.
Rules:
1. Keep the translation natural and fluent
2. Preserve any placeholders like {{variable}}, {name}, etc.
3. Keep markdown formatting if present
4. For UI text, keep it concise
5. Return ONLY a JSON array with the translated texts in the same order
6. The output must be valid JSON array
${context ? `Context: ${context}` : ''}`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputJson }
      ],
      temperature: 0.3,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  // 清理可能的 markdown 代码块
  if (content.startsWith('```')) {
    content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('JSON 解析失败，返回原文');
    return texts;
  }
}

/**
 * 翻译单个语言的所有缺失键
 */
async function translateLanguage(lang, missingKeys, enData, existingData, localesDir) {
  const keys = Object.keys(missingKeys);
  const values = Object.values(missingKeys);
  const result = { ...existingData };

  console.log(`🔄 ${SUPPORTED_LANGUAGES[lang].nativeName} (${lang}) - 翻译 ${keys.length} 个键...`);

  // 分批翻译
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batchKeys = keys.slice(i, i + BATCH_SIZE);
    const batchValues = values.slice(i, i + BATCH_SIZE);

    try {
      const translated = await translateBatch(batchValues, lang, 'UI text for a prompt template app');

      // 映射回键
      for (let j = 0; j < batchKeys.length; j++) {
        result[batchKeys[j]] = translated[j] || batchValues[j];
      }

      console.log(`  [${Math.min(i + BATCH_SIZE, keys.length)}/${keys.length}] ${lang}`);
      await delay(100); // 短暂延迟避免限流
    } catch (err) {
      console.error(`  批次翻译失败: ${err.message}`);
      // 失败时保留原文
      for (let j = 0; j < batchKeys.length; j++) {
        result[batchKeys[j]] = batchValues[j];
      }
    }
  }

  // 按照英文文件的键顺序排序
  const sorted = {};
  for (const key of Object.keys(enData)) {
    if (result[key]) {
      sorted[key] = result[key];
    }
  }

  // 保存文件
  const langPath = path.join(localesDir, `${lang}.json`);
  fs.writeFileSync(langPath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`✅ ${SUPPORTED_LANGUAGES[lang].nativeName} (${lang}) - 完成\n`);

  return sorted;
}

/**
 * 翻译 locale 文件 - 并发处理多个语言
 */
async function translateLocales() {
  console.log('\n📝 开始翻译 Locale 文件...\n');

  const localesDir = path.join(__dirname, '../src/locales');
  const enPath = path.join(localesDir, 'en.json');

  const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  // 收集需要翻译的语言和缺失的键
  const tasks = [];

  for (const lang of TARGET_LANGUAGES) {
    const langPath = path.join(localesDir, `${lang}.json`);
    let existingData = {};

    if (fs.existsSync(langPath)) {
      existingData = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
    }

    // 找出缺失的键
    const missingKeys = {};
    for (const key of Object.keys(enData)) {
      if (!existingData[key]) {
        missingKeys[key] = enData[key];
      }
    }

    if (Object.keys(missingKeys).length === 0) {
      console.log(`✅ ${SUPPORTED_LANGUAGES[lang].nativeName} (${lang}) - 已完整`);
      continue;
    }

    tasks.push({ lang, missingKeys, existingData });
  }

  // 并发翻译
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(task =>
        translateLanguage(task.lang, task.missingKeys, enData, task.existingData, localesDir)
      )
    );
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🌍 DeepSeek 多语言翻译工具 (优化版)\n');

  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 错误: 请设置 DEEPSEEK_API_KEY 环境变量');
    console.error('   用法: DEEPSEEK_API_KEY=your_key node scripts/translate-deepseek.cjs');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const translateLocalesFlag = args.length === 0 || args.includes('--locales');

  try {
    if (translateLocalesFlag) {
      await translateLocales();
    }

    console.log('\n🎉 翻译完成！\n');
  } catch (err) {
    console.error('\n❌ 翻译失败:', err.message);
    process.exit(1);
  }
}

main();
