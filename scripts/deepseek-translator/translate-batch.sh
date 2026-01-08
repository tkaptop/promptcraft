#!/bin/bash
# 通用批量翻译脚本
#
# 用法:
#   ./scripts/translate-batch.sh <source-lang> <file-path> [options]
#
# 示例:
#   ./scripts/translate-batch.sh en landing.json
#   ./scripts/translate-batch.sh en landing.json --dir ./locales

set -e

# 检查参数
if [ $# -lt 2 ]; then
  echo "❌ Error: Missing arguments"
  echo ""
  echo "Usage: $0 <source-lang> <file-path> [options]"
  echo ""
  echo "Options:"
  echo "  --dir <path>      i18n directory (default: ./src/i18n)"
  echo "  --config <path>   Config file path"
  echo "  --api-key <key>   DeepSeek API key"
  echo ""
  echo "Examples:"
  echo "  $0 en landing.json"
  echo "  $0 en landing.json --dir ./locales"
  echo "  $0 en messages.json --config ./my-config.js"
  echo ""
  exit 1
fi

SOURCE_LANG="$1"
FILE_PATH="$2"
shift 2

# 提取其他参数
EXTRA_ARGS="$@"

# 检查环境变量
if [ -z "$DEEPSEEK_API_KEY" ] && [[ ! "$EXTRA_ARGS" =~ "--api-key" ]]; then
  echo "❌ Error: DEEPSEEK_API_KEY environment variable is not set"
  echo ""
  echo "Please set it in .env.local or export it:"
  echo "  export DEEPSEEK_API_KEY=sk-your-api-key-here"
  echo ""
  echo "Or use --api-key flag:"
  echo "  $0 $SOURCE_LANG $FILE_PATH --api-key sk-xxx"
  echo ""
  exit 1
fi

# 所有目标语言
ALL_TARGETS=("en" "zh" "ja" "ko" "es" "fr" "de" "it" "pt" "ru" "ar")
TARGETS=()

# 过滤掉源语言
for TARGET in "${ALL_TARGETS[@]}"; do
  if [ "$TARGET" != "$SOURCE_LANG" ]; then
    TARGETS+=("$TARGET")
  fi
done

# 显示任务信息
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 Batch Translation Task"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Source:  $SOURCE_LANG"
echo "File:    $FILE_PATH"
echo "Targets: ${TARGETS[*]}"
echo "Total:   ${#TARGETS[@]} languages"
if [ -n "$EXTRA_ARGS" ]; then
  echo "Options: $EXTRA_ARGS"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 确认继续
read -p "Continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 0
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 记录开始时间
START_TIME=$(date +%s)
SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_LANGS=()

# 翻译每个目标语言
for i in "${!TARGETS[@]}"; do
  TARGET="${TARGETS[$i]}"
  PROGRESS=$((i + 1))
  TOTAL=${#TARGETS[@]}

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$PROGRESS/$TOTAL] Translating to: $TARGET"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if npx tsx "$SCRIPT_DIR/translator.ts" "$SOURCE_LANG" "$TARGET" "$FILE_PATH" $EXTRA_ARGS; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "✅ $TARGET translation completed"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    FAILED_LANGS+=("$TARGET")
    echo "❌ $TARGET translation failed"
  fi

  # 添加延迟避免触发速率限制（除了最后一个）
  if [ $PROGRESS -lt $TOTAL ]; then
    echo "⏳ Waiting 2 seconds before next translation..."
    sleep 2
  fi
done

# 计算总耗时
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

# 显示总结
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Translation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total:    ${#TARGETS[@]} languages"
echo "Success:  $SUCCESS_COUNT ✅"
echo "Failed:   $FAILED_COUNT ❌"
echo "Time:     ${MINUTES}m ${SECONDS}s"

if [ $FAILED_COUNT -gt 0 ]; then
  echo ""
  echo "Failed languages: ${FAILED_LANGS[*]}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
  echo "🎉 All translations completed successfully!"
  exit 0
else
  echo "⚠️  Some translations failed. Please check the logs above."
  exit 1
fi
