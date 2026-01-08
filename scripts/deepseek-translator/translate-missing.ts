#!/usr/bin/env tsx
/**
 * 翻译并合并缺失的翻译键到各语言文件
 */

import fs from 'fs/promises';
import path from 'path';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const LANGUAGES: Record<string, string> = {
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

interface TranslationItem {
  path: string;
  text: string;
}

async function callDeepSeekAPI(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set');
  }

  const langName = LANGUAGES[targetLang] || targetLang;

  const systemPrompt = `You are a professional translator. Translate the following text to ${langName} (${targetLang}).

Rules:
1. Output ONLY the translated text, no explanations
2. Maintain the original tone and meaning
3. Keep brand names in English: Nano Banana, GPT Image, Veo3, Sora2, Flux Kontext, etc.
4. For technical terms, use commonly accepted translations
5. Be natural and fluent in the target language`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 1.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Translate to ${langName}:\n\n${text}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

function collectTexts(obj: any, currentPath = '', collected: TranslationItem[] = []): TranslationItem[] {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (typeof item === 'string') {
        collected.push({ path: `${currentPath}[${index}]`, text: item });
      } else {
        collectTexts(item, `${currentPath}[${index}]`, collected);
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (typeof value === 'string') {
        collected.push({ path: newPath, text: value });
      } else {
        collectTexts(value, newPath, collected);
      }
    });
  }
  return collected;
}

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

function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

async function translateAndMerge(sourceLang: string, targetLang: string) {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const sourceFile = path.join(scriptDir, 'missing-translations.json');
  const messagesDir = path.join(scriptDir, '../../src/i18n/messages');
  const targetFile = path.join(messagesDir, `${targetLang}.json`);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📝 Translating to: ${LANGUAGES[targetLang]} (${targetLang})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Read source and target files
  const sourceContent = await fs.readFile(sourceFile, 'utf-8');
  const sourceData = JSON.parse(sourceContent);

  const targetContent = await fs.readFile(targetFile, 'utf-8');
  const targetData = JSON.parse(targetContent);

  // Collect texts to translate
  const textsToTranslate = collectTexts(sourceData);
  console.log(`   Found ${textsToTranslate.length} texts to translate`);

  // Create translated structure
  const translatedData: any = {};

  // Translate each text
  for (let i = 0; i < textsToTranslate.length; i++) {
    const item = textsToTranslate[i];
    process.stdout.write(`   [${i + 1}/${textsToTranslate.length}] Translating: ${item.path.slice(0, 50)}... `);

    try {
      const translated = await callDeepSeekAPI(item.text, targetLang);
      setValueByPath(translatedData, item.path, translated);
      console.log('✅');
    } catch (error) {
      console.log('❌');
      console.error(`      Error: ${error}`);
      setValueByPath(translatedData, item.path, item.text); // Keep original on error
    }

    // Small delay between API calls
    await new Promise(r => setTimeout(r, 100));
  }

  // Merge translated data into target file
  const mergedData = deepMerge(targetData, translatedData);

  // Save
  await fs.writeFile(targetFile, JSON.stringify(mergedData, null, 2) + '\n', 'utf-8');
  console.log(`   ✅ Saved to: ${targetFile}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Translate to all languages
    const targets = Object.keys(LANGUAGES);
    console.log(`\n🌍 Translating missing keys to ${targets.length} languages...`);

    for (const target of targets) {
      await translateAndMerge('en', target);
    }

    console.log('\n🎉 All translations completed!');
  } else {
    // Translate to specific language
    const target = args[0];
    if (!LANGUAGES[target]) {
      console.error(`❌ Unknown language: ${target}`);
      console.error(`   Supported: ${Object.keys(LANGUAGES).join(', ')}`);
      process.exit(1);
    }
    await translateAndMerge('en', target);
  }
}

main().catch(console.error);
