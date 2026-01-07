import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_TEMPLATES_CONFIG, SYSTEM_DATA_VERSION } from '../src/data/templates.js';
import { INITIAL_BANKS, INITIAL_DEFAULTS, INITIAL_CATEGORIES } from '../src/data/banks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 读取 package.json 获取应用版本号
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

const templatesData = {
  version: SYSTEM_DATA_VERSION,
  config: INITIAL_TEMPLATES_CONFIG
};

const banksData = {
  banks: INITIAL_BANKS,
  defaults: INITIAL_DEFAULTS,
  categories: INITIAL_CATEGORIES
};

const versionData = {
  appVersion: pkg.version,
  dataVersion: SYSTEM_DATA_VERSION,
  updatedAt: new Date().toISOString()
};

// 确保目录存在
const outputDir = path.join(rootDir, 'public', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 写入 JSON 文件
fs.writeFileSync(path.join(outputDir, 'templates.json'), JSON.stringify(templatesData, null, 2));
fs.writeFileSync(path.join(outputDir, 'banks.json'), JSON.stringify(banksData, null, 2));
fs.writeFileSync(path.join(outputDir, 'version.json'), JSON.stringify(versionData, null, 2));

// 同时更新根目录下的 public/version.json (如果存在) 用于旧版兼容或 Vercel 检测
fs.writeFileSync(path.join(rootDir, 'public', 'version.json'), JSON.stringify(versionData, null, 2));

console.log('✅ 数据同步成功！已将 src/data/*.js 转换为 public/data/*.json');
console.log(`🚀 当前版本: App V${pkg.version} | Data V${SYSTEM_DATA_VERSION}`);
