# 🌍 DeepSeek 翻译工具

使用 DeepSeek API 自动翻译多语言 JSON 文件的通用工具。

## 🚀 快速开始

### 1. 配置 API Key

在项目根目录的 `.env.local` 中添加：

```bash
DEEPSEEK_API_KEY=sk-你的密钥
```

获取 API Key: https://platform.deepseek.com/api_keys

### 2. 开始翻译

```bash
# 单个语言
tsx scripts/deepseek-translator/translator.ts en zh your-file.json

# 所有语言
./scripts/deepseek-translator/translate-batch.sh en your-file.json
```

## 📖 使用说明

### 基本命令

```bash
# 翻译单个文件
tsx translator.ts <源语言> <目标语言> <文件路径>

# 批量翻译（所有语言）
./translate-batch.sh <源语言> <文件路径>
```

### 命令行选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `--dir <path>` | i18n 目录 | `./src/i18n` |
| `--config <path>` | 配置文件 | `.translator.config.js` |
| `--api-key <key>` | API Key | 从环境变量获取 |
| `--temperature <num>` | 翻译温度 | `1.3` |
| `--batch-size <num>` | 批处理大小 | `5` |

### 使用示例

```bash
# Gempix2 项目
tsx translator.ts en zh pages/landing/en.json

# Vue i18n 项目
tsx translator.ts en ja messages.json --dir ./locales

# 自定义配置
tsx translator.ts en ko file.json --config ./my-config.js
```

## ⚙️ 配置

### 方式 1: 环境变量（推荐）

```bash
# .env.local
DEEPSEEK_API_KEY=sk-xxx
```

### 方式 2: 配置文件

复制 `translator.config.example.js` 为 `.translator.config.js`：

```javascript
export default {
  apiKey: process.env.DEEPSEEK_API_KEY,
  i18nDir: './src/i18n',
  temperature: 1.3,
  batchSize: 5,
  skipKeys: ['url', 'src', 'icon', 'href'],
};
```

## 📦 复制到其他项目

### 方法 1: 复制整个文件夹

```bash
cp -r scripts/deepseek-translator /path/to/other-project/scripts/
```

### 方法 2: 只复制核心文件

```bash
# 进入目标项目
cd /path/to/other-project

# 复制核心文件
cp /path/to/this/translator.ts ./
cp /path/to/this/translate-batch.sh ./
chmod +x ./translate-batch.sh

# 配置 API Key
echo "DEEPSEEK_API_KEY=sk-xxx" >> .env.local

# 开始使用
tsx translator.ts en zh file.json --dir ./your-i18n-dir
```

## 🌐 支持的语言

`en` `zh` `ja` `ko` `es` `fr` `de` `it` `pt` `ru` `ar`

可在配置文件中添加更多语言。

## ✨ 特性

- ✅ **通用可复用** - 适用于任何项目
- ✅ **专业本地化** - 地道翻译，非机械直译
- ✅ **智能批处理** - 优化 API 调用
- ✅ **自动重试** - 网络错误处理
- ✅ **灵活配置** - 多种配置方式
- ✅ **经济实惠** - ¥0.1-0.3 元/大型页面

## 💰 费用

DeepSeek API 定价：
- 输入：¥1 / 百万 tokens
- 输出：¥2 / 百万 tokens

翻译一个大型页面（500 个文本）：约 ¥0.1 - 0.3 元

## ❓ 常见问题

### Q: 如何跳过特定字段？

在配置文件中添加：

```javascript
skipKeys: ['url', 'href', 'icon', 'your-custom-field']
```

### Q: 如何添加新语言？

在配置文件中添加：

```javascript
languages: {
  'zh-TW': '繁體中文',
  'vi': 'Tiếng Việt',
}
```

### Q: 遇到速率限制怎么办？

减小批处理大小：

```bash
tsx translator.ts en zh file.json --batch-size 3
```

### Q: 支持哪些项目结构？

任何项目都支持，只需指定 `--dir` 参数：

```bash
# Next.js
--dir ./src/i18n

# Vue i18n
--dir ./locales

# 自定义
--dir ./your-custom-path
```

## 🔗 参考

- [DeepSeek API 文档](https://api-docs.deepseek.com/zh-cn/)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [获取 API Key](https://platform.deepseek.com/api_keys)

---

**Made with ❤️ using DeepSeek API**
