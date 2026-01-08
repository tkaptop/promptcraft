#!/usr/bin/env node
/**
 * 生成 banks.js 和 templates.js 的翻译键
 * 将 label 和 options 的中英文提取到 locale 文件中
 *
 * 翻译键命名规则：
 * - bank label: bank_{bankId}_label
 * - bank option: bank_{bankId}_opt_{index}
 * - template name: tpl_{templateId}_name
 * - category label: cat_{categoryId}_label
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 banks.js 和 templates.js
const banksPath = path.join(__dirname, '../src/data/banks.js');
const templatesPath = path.join(__dirname, '../src/data/templates.js');
const cnLocalePath = path.join(__dirname, '../src/locales/cn.json');
const enLocalePath = path.join(__dirname, '../src/locales/en.json');

// 动态导入 ES 模块
async function loadDataModules() {
  const banksModule = await import(banksPath);
  const templatesModule = await import(templatesPath);
  return {
    INITIAL_BANKS: banksModule.INITIAL_BANKS,
    INITIAL_CATEGORIES: banksModule.INITIAL_CATEGORIES,
    INITIAL_TEMPLATES_CONFIG: templatesModule.INITIAL_TEMPLATES_CONFIG
  };
}

async function main() {
  console.log('正在生成数据翻译键...\n');

  const { INITIAL_BANKS, INITIAL_CATEGORIES, INITIAL_TEMPLATES_CONFIG } = await loadDataModules();

  // 读取现有的 locale 文件
  const cnLocale = JSON.parse(fs.readFileSync(cnLocalePath, 'utf-8'));
  const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'));

  const newCnKeys = {};
  const newEnKeys = {};

  // 1. 处理 categories
  console.log('处理分类 (categories)...');
  for (const [catId, catData] of Object.entries(INITIAL_CATEGORIES)) {
    const labelKey = `cat_${catId}_label`;
    if (catData.label) {
      if (typeof catData.label === 'object') {
        newCnKeys[labelKey] = catData.label.cn || catData.label.en || '';
        newEnKeys[labelKey] = catData.label.en || catData.label.cn || '';
      } else {
        newCnKeys[labelKey] = catData.label;
        newEnKeys[labelKey] = catData.label;
      }
    }
  }
  console.log(`  - 生成 ${Object.keys(INITIAL_CATEGORIES).length} 个分类翻译键`);

  // 2. 处理 banks
  console.log('处理词库 (banks)...');
  let bankLabelCount = 0;
  let bankOptionCount = 0;

  for (const [bankId, bankData] of Object.entries(INITIAL_BANKS)) {
    // bank label
    const labelKey = `bank_${bankId}_label`;
    if (bankData.label) {
      if (typeof bankData.label === 'object') {
        newCnKeys[labelKey] = bankData.label.cn || bankData.label.en || '';
        newEnKeys[labelKey] = bankData.label.en || bankData.label.cn || '';
      } else {
        newCnKeys[labelKey] = bankData.label;
        newEnKeys[labelKey] = bankData.label;
      }
      bankLabelCount++;
    }

    // bank options
    if (bankData.options && Array.isArray(bankData.options)) {
      bankData.options.forEach((opt, index) => {
        const optKey = `bank_${bankId}_opt_${index}`;
        if (typeof opt === 'object') {
          newCnKeys[optKey] = opt.cn || opt.en || '';
          newEnKeys[optKey] = opt.en || opt.cn || '';
        } else {
          newCnKeys[optKey] = opt;
          newEnKeys[optKey] = opt;
        }
        bankOptionCount++;
      });
    }
  }
  console.log(`  - 生成 ${bankLabelCount} 个词库标签翻译键`);
  console.log(`  - 生成 ${bankOptionCount} 个词库选项翻译键`);

  // 3. 处理 templates
  console.log('处理模版 (templates)...');
  let templateNameCount = 0;

  for (const tpl of INITIAL_TEMPLATES_CONFIG) {
    const nameKey = `tpl_${tpl.id}_name`;
    if (tpl.name) {
      if (typeof tpl.name === 'object') {
        newCnKeys[nameKey] = tpl.name.cn || tpl.name.en || '';
        newEnKeys[nameKey] = tpl.name.en || tpl.name.cn || '';
      } else {
        newCnKeys[nameKey] = tpl.name;
        newEnKeys[nameKey] = tpl.name;
      }
      templateNameCount++;
    }
  }
  console.log(`  - 生成 ${templateNameCount} 个模版名称翻译键`);

  // 4. 合并到现有 locale 文件
  const mergedCn = { ...cnLocale, ...newCnKeys };
  const mergedEn = { ...enLocale, ...newEnKeys };

  // 5. 写入文件
  fs.writeFileSync(cnLocalePath, JSON.stringify(mergedCn, null, 2) + '\n', 'utf-8');
  fs.writeFileSync(enLocalePath, JSON.stringify(mergedEn, null, 2) + '\n', 'utf-8');

  console.log('\n完成！');
  console.log(`  - cn.json: 新增 ${Object.keys(newCnKeys).length} 个键`);
  console.log(`  - en.json: 新增 ${Object.keys(newEnKeys).length} 个键`);
  console.log('\n下一步：运行翻译脚本将这些键翻译到其他语言');
}

main().catch(console.error);
