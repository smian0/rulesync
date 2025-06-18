# rulesync

[![CI](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml/badge.svg)](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rulesync.svg)](https://www.npmjs.com/package/rulesync)

統一されたAIルール設定ファイル（`.rulesync/*.md`）から、各種AI開発支援ツールの設定ファイルを自動生成するNode.js CLIツールです。

## 対応ツール

- **GitHub Copilot Custom Instructions** (`.github/instructions/*.instructions.md`)
- **Cursor Project Rules** (`.cursor/rules/*.md`) 
- **Cline Rules** (`.clinerules/*.md`)

## インストール

```bash
npm install -g rulesync
# または
pnpm add -g rulesync
# または  
yarn global add rulesync
```

## 使用方法

### 1. 初期化

```bash
rulesync init
```

`.rulesync/` ディレクトリとサンプルルールファイルが作成されます。

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
rulesync generate

# 特定ツールのみ
rulesync generate --copilot
rulesync generate --cursor  
rulesync generate --cline
```

### 4. その他のコマンド

```bash
# 設定の妥当性チェック
rulesync validate

# 現在の状況確認
rulesync status

# ファイル監視・自動生成
rulesync watch
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