# ai-rules

[![CI](https://github.com/dyoshikawa/ai-rules/actions/workflows/ci.yml/badge.svg)](https://github.com/dyoshikawa/ai-rules/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/ai-rules.svg)](https://www.npmjs.com/package/ai-rules)

統一されたAIルール設定ファイル（`.ai-rules/*.md`）から、各種AI開発支援ツールの設定ファイルを自動生成するNode.js CLIツールです。

## 対応ツール

- **GitHub Copilot Custom Instructions** (`.github/instructions/*.instructions.md`)
- **Cursor Project Rules** (`.cursor/rules/*.md`) 
- **Cline Rules** (`.clinerules/*.md`)

## インストール

```bash
npm install -g ai-rules
# または
pnpm add -g ai-rules
# または  
yarn global add ai-rules
```

## 使用方法

### 1. 初期化

```bash
ai-rules init
```

`.ai-rules/` ディレクトリとサンプルルールファイルが作成されます。

### 2. ルールファイルの編集

各Markdownファイルにフロントマターでメタデータを記述します：

```markdown
---
priority: high
targets: ["*"] # または [copilot, cursor, cline]
description: "TypeScriptコーディングルール"
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Rules

- TypeScriptを使用する
- 型注釈を明確に記述する
```

### 3. 設定ファイル生成

```bash
# 全ツール用設定ファイル生成
ai-rules generate

# 特定ツールのみ
ai-rules generate --copilot
ai-rules generate --cursor  
ai-rules generate --cline
```

### 4. その他のコマンド

```bash
# 設定の妥当性チェック
ai-rules validate

# 現在の状況確認
ai-rules status

# ファイル監視・自動生成
ai-rules watch
```

## 設定ファイル構造

```
.ai-rules/
├── coding-rules.md      # コーディングルール
├── naming-conventions.md # 命名規則
├── architecture.md      # アーキテクチャガイドライン
├── security.md          # セキュリティルール
└── custom.md           # プロジェクト固有ルール
```

## 生成される設定ファイル

| ツール | 出力先 | 形式 |
|--------|--------|------|
| GitHub Copilot | `.github/instructions/*.instructions.md` | Front Matter + Markdown |
| Cursor | `.cursor/rules/*.md` | MDC (YAML header + Markdown) |
| Cline | `.clinerules/*.md` | プレーンMarkdown |

## 開発

```bash
# 依存関係インストール
pnpm install

# 開発実行
pnpm dev

# ビルド
pnpm build

# テスト
pnpm test

# コード品質チェック
pnpm lint
pnpm format
pnpm secretlint
```

## ライセンス

MIT License

## 貢献

Issue や Pull Request をお待ちしています！

詳細な仕様については [SPECIFICATION.md](./SPECIFICATION.md) をご覧ください。