#!/usr/bin/env node
/**
 * 拆分语言JSON文件为多个小文件
 * 按前缀分类：common, banks, templates, seo
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar'];

// 定义拆分规则
const SPLIT_RULES = {
  banks: (key) => key.startsWith('bank_'),
  templates: (key) => key.startsWith('tpl_') || key.startsWith('cat_') || key.startsWith('category_'),
  seo: (key) => key.startsWith('seo_'),
  // common: 其他所有
};

function splitLocale(lang) {
  const sourceFile = path.join(LOCALES_DIR, `${lang}.json`);
  const targetDir = path.join(LOCALES_DIR, lang);
  
  if (!fs.existsSync(sourceFile)) {
    console.log(`⏭️  Skipping ${lang}: source file not found`);
    return;
  }
  
  console.log(`\n📂 Processing ${lang}...`);
  
  const data = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  
  const result = {
    common: {},
    banks: {},
    templates: {},
    seo: {},
  };
  
  // 分类所有key
  for (const [key, value] of Object.entries(data)) {
    let matched = false;
    for (const [category, rule] of Object.entries(SPLIT_RULES)) {
      if (rule(key)) {
        result[category][key] = value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.common[key] = value;
    }
  }
  
  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 写入拆分后的文件
  for (const [category, content] of Object.entries(result)) {
    const targetFile = path.join(targetDir, `${category}.json`);
    const count = Object.keys(content).length;
    if (count > 0) {
      fs.writeFileSync(targetFile, JSON.stringify(content, null, 2) + '\n', 'utf-8');
      console.log(`   ✅ ${category}.json: ${count} keys`);
    }
  }
  
  // 统计
  const total = Object.keys(data).length;
  console.log(`   📊 Total: ${total} keys split into ${Object.keys(result).length} files`);
}

// 主函数
function main() {
  console.log('🔧 Splitting locale files...\n');
  
  for (const lang of LANGUAGES) {
    splitLocale(lang);
  }
  
  console.log('\n✅ Done! Files split into:');
  console.log('   - common.json   (UI texts)');
  console.log('   - banks.json    (bank_* keys)');
  console.log('   - templates.json (tpl_*, cat_* keys)');
  console.log('   - seo.json      (seo_* keys)');
  console.log('\n⚠️  Remember to update src/constants/translations.js to load split files!');
}

main();

