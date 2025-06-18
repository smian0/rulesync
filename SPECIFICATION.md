# rulesync CLI Tool 仕様書

## 概要

rulesyncは、統一されたAIルール設定ファイル（`.rulesync/*.md`）から、各種AI開発支援ツールの設定ファイルを自動生成するNode.js CLIツールです。

## 目的

複数のAI開発支援ツールを使用する際、それぞれ異なる設定ファイル形式でルールを記述する必要があります。rulesyncは以下の問題を解決します：

- 設定の重複管理による保守コストの増大
- ツール間でのルール一貫性の確保
- 新しいプロジェクトでの設定作業の効率化

## 機能

### 1. 統一設定ファイル管理
- `.rulesync/` ディレクトリ内のMarkdownファイルを統一設定として管理
- セクション単位でのルール分類（コーディングルール、命名規則、アーキテクチャガイドライン等）

### 2. 対応ツール設定生成

#### GitHub Copilot Custom Instructions

https://code.visualstudio.com/docs/copilot/copilot-customization#_use-instructionsmd-files

- **出力先**: `.github/instructions/*.instructions.md`
- **形式**: GitHub Copilot用のプレーンMarkdown形式
- **仕様詳細**:
  - ファイル名は必ず `.instructions.md` で終わる必要がある
  - 複数のinstructionsファイルが組み合わされる
  - オプションでFront Matterメタデータ（`description`, `applyTo`）をサポート
  - `applyTo`でファイルパターンを指定可能（例: `**/*.ts,**/*.tsx`）
  - 短く自己完結型の指示を推奨
  - 複数ファイルに分割して整理・再利用性を向上

#### Cursor Project Rules

https://docs.cursor.com/context/rules

- **出力先**: `.cursor/rules/*.md` 
- **形式**: MDC（Markdown with Configuration）形式
- **仕様詳細**:
  - YAMLヘッダーで設定を記述
  - ルールタイプ: `Always`, `Auto Attached`, `Agent Requested`, `Manual`
  - サポート設定: `description`, `globs`, `alwaysApply`
  - ファイル参照: `@filename` で他ファイルを参照可能
  - ネストした `.cursor/rules` ディレクトリをサポート
  - 500行未満を推奨、具体例を含める
  - 大きな概念は複数ルールに分割

#### Cline Rules

https://docs.cline.bot/features/cline-rules

- **出力先**: `.clinerules/*.md`
- **形式**: プレーンMarkdown形式
- **仕様詳細**:
  - `.clinerules/` 内の全Markdownファイルを自動処理
  - 数値プレフィックスで整理可能（例: `01-coding.md`, `02-documentation.md`）
  - 階層的セクション構造をサポート
  - 「ルールバンク」アプローチでアクティブ/非アクティブセットを管理
  - 明確で簡潔な言語を使用
  - 望む結果に焦点を当てる（具体的なステップではなく）
  - バージョン管理された柔軟なプロジェクトガイダンス

#### Claude Code Memory

https://docs.anthropic.com/en/docs/claude-code/memory#how-claude-looks-up-memories

### 3. CLI コマンド

```bash
# 初期化（.rulesync/ディレクトリとサンプルファイル作成）
rulesync init

# 全ツール設定ファイル生成
rulesync generate

# 特定ツール設定ファイル生成
rulesync generate --copilot
rulesync generate --cursor
rulesync generate --cline

# 設定ファイル監視・自動生成
rulesync watch

# 現在の設定状況確認
rulesync status

# 設定ファイルの妥当性チェック
rulesync validate
```

## 設定ファイル構造

### `.rulesync/` ディレクトリ構造
```
.rulesync/
├── coding-rules.md      # コーディングルール
├── naming-conventions.md # 命名規則
├── architecture.md      # アーキテクチャガイドライン
├── security.md          # セキュリティルール
└── custom.md           # プロジェクト固有ルール
```

### 設定ファイル形式
各Markdownファイルは以下のフロントマターを持ちます：

```markdown
---
priority: high|medium|low
targets: ["*"] # または [copilot, cursor, cline]
description: "ルールの簡潔な説明"
globs: ["**/*.ts", "**/*.js"]
---

# ルールタイトル

ルールの詳細説明...
```

## 技術仕様

### 環境要件
- Node.js 20.0.0以上（推奨: 24.0.0以上）
- TypeScript 5.0以上
- pnpm (推奨パッケージマネージャー)

### 開発ツール
- **TypeScript**: 型安全性とモダンJS機能
- **Biome**: 統一されたリンター・フォーマッター
- **Commander.js**: CLIフレームワーク
- **tsup**: 本番用バンドルビルド
- **tsx**: 開発用TypeScript実行環境

### 依存関係（予定）
- Commander.js (CLI フレームワーク)
- Chokidar (ファイル監視)
- Gray-matter (フロントマター解析)
- Marked (Markdown解析)

### プロジェクト構造
```
rulesync/
├── src/
│   ├── cli/
│   │   ├── commands/        # CLI コマンド実装
│   │   │   ├── init.ts
│   │   │   ├── generate.ts
│   │   │   ├── watch.ts
│   │   │   ├── status.ts
│   │   │   └── validate.ts
│   │   └── index.ts        # CLI エントリーポイント
│   ├── core/
│   │   ├── parser.ts       # .rulesync ファイル解析
│   │   ├── generator.ts    # 各ツール設定生成
│   │   └── validator.ts    # 設定ファイル検証
│   ├── generators/         # 各ツール用ジェネレーター
│   │   ├── copilot.ts
│   │   ├── cursor.ts
│   │   └── cline.ts
│   ├── templates/          # 各ツール用テンプレート
│   ├── types/              # TypeScript型定義
│   │   ├── config.ts
│   │   └── rules.ts
│   └── utils/
│       ├── file.ts         # ファイル操作
│       └── config.ts       # 設定管理
├── dist/                   # ビルド出力
├── tests/                  # テストファイル
├── package.json
├── tsconfig.json
├── biome.json             # Biome設定
└── README.md
```

### ビルドとパッケージング
```bash
# 開発（tsx使用）
pnpm dev

# 本番ビルド（tsup使用）
pnpm build

# リンターとフォーマッター（Biome使用）
pnpm lint
pnpm format

# テスト
pnpm test

# パッケージ公開
pnpm publish
```

### package.json スクリプト例
```json
{
  "scripts": {
    "dev": "tsx src/cli/index.ts",
    "build": "tsup src/cli/index.ts --format cjs,esm --dts --clean",
    "lint": "biome lint src/",
    "format": "biome format --write src/",
    "check": "biome check src/",
    "test": "vitest"
  }
}
```

## 今後の拡張予定

### 対応ツール追加
- Claude Desktop
- Windsurf
- Aider
- Continue

### 機能拡張
- Web UI での設定管理
- チーム設定の共有機能
- 設定テンプレートライブラリ
- Git hooks 連携
- `/init-rulesync` カスタムスラッシュコマンド

## 使用例

```bash
# プロジェクト初期化
cd my-project
rulesync init

# .rulesync/coding-rules.md を編集
vim .rulesync/coding-rules.md

# 設定ファイル生成
rulesync generate

# 結果確認
ls copilot-instructions.md
ls .cursor/rules/
ls .clinerules/
```