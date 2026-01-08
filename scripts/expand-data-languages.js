/**
 * 扩展数据文件的多语言支持
 *
 * 将 banks.js 和 templates.js 中的 {cn, en} 双语对象
 * 扩展为支持 11 种语言的多语言对象
 *
 * 使用方法:
 * DEEPSEEK_API_KEY=your_key node scripts/expand-data-languages.js
 */

const fs = require('fs');
const path = require('path');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const TARGET_LANGUAGES = {
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

async function translateTexts(texts, targetLang) {
  const langName = TARGET_LANGUAGES[targetLang];

  // 将数组转为对象以便翻译
  const textsObj = {};
  texts.forEach((t, i) => { textsObj[`t${i}`] = t; });

  const prompt = `Translate the following texts to ${langName}.
Return ONLY a JSON object with the same keys and translated values.
Keep any placeholders like {{variable}} unchanged.

${JSON.stringify(textsObj, null, 2)}`;

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

  if (content.startsWith('```')) {
    content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }

  const result = JSON.parse(content);

  // 转回数组
  return texts.map((_, i) => result[`t${i}`] || texts[i]);
}

async function expandBanks() {
  console.log('\n📦 扩展 banks.js 多语言支持...\n');

  const banksPath = path.join(__dirname, '../src/data/banks.js');
  let content = fs.readFileSync(banksPath, 'utf-8');

  // 提取所有英文文本
  const labelMatches = [...content.matchAll(/label:\s*\{\s*cn:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g)];
  const optionMatches = [...content.matchAll(/\{\s*cn:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g)];

  // 收集唯一的英文文本
  const uniqueTexts = new Set();
  labelMatches.forEach(m => uniqueTexts.add(m[2]));
  optionMatches.forEach(m => uniqueTexts.add(m[2]));

  const textsArray = Array.from(uniqueTexts);
  console.log(`  找到 ${textsArray.length} 个唯一文本\n`);

  // 为每种语言翻译
  const translations = {};

  for (const [lang, langName] of Object.entries(TARGET_LANGUAGES)) {
    console.log(`  🔄 翻译到 ${langName}...`);
    translations[lang] = {};

    // 分批翻译
    const batchSize = 30;
    for (let i = 0; i < textsArray.length; i += batchSize) {
      const batch = textsArray.slice(i, i + batchSize);
      console.log(`    批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(textsArray.length / batchSize)}...`);

      try {
        const results = await translateTexts(batch, lang);
        batch.forEach((text, idx) => {
          translations[lang][text] = results[idx];
        });
        await delay(500);
      } catch (err) {
        console.error(`    翻译失败: ${err.message}`);
        batch.forEach(text => {
          translations[lang][text] = text; // 失败时保留原文
        });
      }
    }
    console.log(`  ✅ ${langName} 完成\n`);
  }

  // 替换文件内容
  // 替换 label 对象
  content = content.replace(
    /label:\s*\{\s*cn:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g,
    (match, cn, en) => {
      const parts = [`cn: "${cn}"`, `en: "${en}"`];
      for (const lang of Object.keys(TARGET_LANGUAGES)) {
        const translated = translations[lang][en] || en;
        parts.push(`${lang}: "${translated.replace(/"/g, '\\"')}"`);
      }
      return `label: { ${parts.join(', ')} }`;
    }
  );

  // 替换 options 中的对象（需要更精确的匹配）
  content = content.replace(
    /(\s*)\{\s*cn:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g,
    (match, indent, cn, en) => {
      // 跳过已经是 label 的（已处理）
      if (match.includes('label:')) return match;

      const parts = [`cn: "${cn}"`, `en: "${en}"`];
      for (const lang of Object.keys(TARGET_LANGUAGES)) {
        const translated = translations[lang][en] || en;
        parts.push(`${lang}: "${translated.replace(/"/g, '\\"')}"`);
      }
      return `${indent}{ ${parts.join(', ')} }`;
    }
  );

  fs.writeFileSync(banksPath, content, 'utf-8');
  console.log('✅ banks.js 扩展完成\n');
}

async function expandTemplates() {
  console.log('\n📄 扩展 templates.js 多语言支持...\n');

  const templatesPath = path.join(__dirname, '../src/data/templates.js');
  let content = fs.readFileSync(templatesPath, 'utf-8');

  // 只翻译 name 字段（content 太长，保持中英双语）
  const nameMatches = [...content.matchAll(/name:\s*\{\s*cn:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g)];

  const uniqueNames = new Set();
  nameMatches.forEach(m => uniqueNames.add(m[2]));

  const namesArray = Array.from(uniqueNames);
  console.log(`  找到 ${namesArray.length} 个模版名称\n`);

  const translations = {};

  for (const [lang, langName] of Object.entries(TARGET_LANGUAGES)) {
    console.log(`  🔄 翻译到 ${langName}...`);
    translations[lang] = {};

    try {
      const results = await translateTexts(namesArray, lang);
      namesArray.forEach((name, idx) => {
        translations[lang][name] = results[idx];
      });
      await delay(500);
    } catch (err) {
      console.error(`    翻译失败: ${err.message}`);
      namesArray.forEach(name => {
        translations[lang][name] = name;
      });
    }
    console.log(`  ✅ ${langName} 完成\n`);
  }

  // 替换 name 对象
  content = content.replace(
    /name:\s*\{\s*cn:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g,
    (match, cn, en) => {
      const parts = [`cn: "${cn}"`, `en: "${en}"`];
      for (const lang of Object.keys(TARGET_LANGUAGES)) {
        const translated = translations[lang][en] || en;
        parts.push(`${lang}: "${translated.replace(/"/g, '\\"')}"`);
      }
      return `name: { ${parts.join(', ')} }`;
    }
  );

  fs.writeFileSync(templatesPath, content, 'utf-8');
  console.log('✅ templates.js 扩展完成\n');
}

async function main() {
  if (!DEEPSEEK_API_KEY) {
    console.error('❌ 请设置 DEEPSEEK_API_KEY 环境变量');
    process.exit(1);
  }

  console.log('🌍 扩展数据文件多语言支持\n');

  await expandBanks();
  await expandTemplates();

  console.log('🎉 全部完成！');
}

main();
