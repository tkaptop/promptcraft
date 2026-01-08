#!/bin/bash
# 批量翻译脚本 - 将一个文件翻译成多种语言
#
# 用法:
#   ./scripts/translate-all.sh <source-lang> <file-path>
#
# 示例:
#   ./scripts/translate-all.sh en pages/landing/en.json

set -e

# 检查参数
if [ $# -lt 2 ]; then
  echo "❌ Error: Missing arguments"
  echo ""
  echo "Usage: $0 <source-lang> <file-path>"
  echo ""
  echo "Examples:"
  echo "  $0 en pages/landing/en.json"
  echo "  $0 en messages/en.json"
  echo ""
  exit 1
fi

SOURCE_LANG="$1"
FILE_PATH="$2"

# 检查环境变量
if [ -z "$DEEPSEEK_API_KEY" ]; then
  echo "❌ Error: DEEPSEEK_API_KEY environment variable is not set"
  echo ""
  echo "Please set it in .env.local or export it:"
  echo "  export DEEPSEEK_API_KEY=sk-your-api-key-here"
  echo ""
  exit 1
fi

# 要翻译的目标语言列表（排除源语言）
ALL_TARGETS=("zh" "ja" "ko" "es" "fr" "de" "it" "pt" "ru" "ar")
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
echo "Source: $SOURCE_LANG"
echo "File:   $FILE_PATH"
echo "Targets: ${TARGETS[*]}"
echo "Total:  ${#TARGETS[@]} languages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 确认继续
read -p "Continue? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 0
fi

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

  if tsx scripts/translate-i18n.ts "$SOURCE_LANG" "$TARGET" "$FILE_PATH"; then
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
