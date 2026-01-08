/**
 * 同步缺失的 locale 翻译键
 *
 * 使用方法:
 * DEEPSEEK_API_KEY=your_key node scripts/sync-missing-locales.js
 */

const fs = require('fs');
const path = require('path');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const LANGUAGES = {
  ja: '日本語 (Japanese)',
  ko: '한국어 (Korean)',
  es: 'Español (Spanish)',
  de: 'Deutsch (German)',
  fr: 'Français (French)',
  ru: 'Русский (Russian)',
  ar: 'العربية (Arabic)',
  pt: 'Português (Portuguese)',
  it: 'Italiano (Italian)'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatch(texts, targetLang) {
  const langName = LANGUAGES[targetLang];

  const prompt = `Translate the following JSON object values to ${langName}.
Keep the keys unchanged. Return ONLY valid JSON, no explanations.
Preserve any placeholders like {{variable}}.

${JSON.stringify(texts, null, 2)}`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional translator. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  // 清理可能的 markdown 代码块
  if (content.startsWith('```')) {
    content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(content);
}

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 请设置 DEEPSEEK_API_KEY 环境变量');
    process.exit(1);
  }

  const localesDir = path.join(__dirname, '../src/locales');
  const enData = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));
  const enKeys = Object.keys(enData);

  console.log('🌍 开始同步缺失的翻译...\n');

  for (const [lang, langName] of Object.entries(LANGUAGES)) {
    const langPath = path.join(localesDir, `${lang}.json`);
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf-8'));

    // 找出缺失的键
    const missingKeys = enKeys.filter(k => !langData[k]);

    if (missingKeys.length === 0) {
      console.log(`✅ ${langName} - 已完整`);
      continue;
    }

    console.log(`🔄 ${langName} - 翻译 ${missingKeys.length} 个键...`);

    // 准备要翻译的文本
    const textsToTranslate = {};
    for (const key of missingKeys) {
      textsToTranslate[key] = enData[key];
    }

    try {
      // 分批翻译（每批 20 个）
      const batchSize = 20;
      const keys = Object.keys(textsToTranslate);
      let translated = {};

      for (let i = 0; i < keys.length; i += batchSize) {
        const batchKeys = keys.slice(i, i + batchSize);
        const batch = {};
        for (const k of batchKeys) {
          batch[k] = textsToTranslate[k];
        }

        console.log(`  批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(keys.length / batchSize)}...`);
        const result = await translateBatch(batch, lang);
        translated = { ...translated, ...result };

        await delay(500); // 避免限流
      }

      // 合并并按英文键顺序排序
      const merged = { ...langData, ...translated };
      const sorted = {};
      for (const key of enKeys) {
        if (merged[key]) {
          sorted[key] = merged[key];
        }
      }

      fs.writeFileSync(langPath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
      console.log(`✅ ${langName} - 完成\n`);

    } catch (err) {
      console.error(`❌ ${langName} 翻译失败: ${err.message}\n`);
    }
  }

  console.log('🎉 同步完成！');
}

main();
