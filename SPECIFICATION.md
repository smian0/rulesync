# ai-rules CLI Tool 仕様書

## 概要

ai-rulesは、統一されたAIルール設定ファイル（`.ai-rules/*.md`）から、各種AI開発支援ツールの設定ファイルを自動生成するNode.js CLIツールです。

## 目的

複数のAI開発支援ツールを使用する際、それぞれ異なる設定ファイル形式でルールを記述する必要があります。ai-rulesは以下の問題を解決します：

- 設定の重複管理による保守コストの増大
- ツール間でのルール一貫性の確保
- 新しいプロジェクトでの設定作業の効率化

## 機能

### 1. 統一設定ファイル管理
- `.ai-rules/` ディレクトリ内のMarkdownファイルを統一設定として管理
- セクション単位でのルール分類（コーディングルール、命名規則、アーキテクチャガイドライン等）

### 2. 対応ツール設定生成

#### GitHub Copilot
- **出力先**: `copilot-instructions.md`
- **形式**: GitHub Copilot用のプレーンMarkdown形式

#### Cursor
- **出力先**: `.cursor/rules/*.md`
- **形式**: Cursor IDE用のルール設定ファイル

#### Cline
- **出力先**: `.clinerules/*.md`
- **形式**: Cline AI Assistant用のルール設定ファイル

### 3. CLI コマンド

```bash
# 初期化（.ai-rules/ディレクトリとサンプルファイル作成）
ai-rules init

# 全ツール設定ファイル生成
ai-rules generate

# 特定ツール設定ファイル生成
ai-rules generate --copilot
ai-rules generate --cursor
ai-rules generate --cline

# 設定ファイル監視・自動生成
ai-rules watch

# 現在の設定状況確認
ai-rules status

# 設定ファイルの妥当性チェック
ai-rules validate
```

## 設定ファイル構造

### `.ai-rules/` ディレクトリ構造
```
.ai-rules/
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
targets: [copilot, cursor, cline]
category: coding|naming|architecture|security|custom
---

# ルールタイトル

ルールの詳細説明...
```

## 技術仕様

### 環境要件
- Node.js 18.0.0以上
- TypeScript 5.0以上
- npm/yarn/pnpm

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
ai-rules/
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
│   │   ├── parser.ts       # .ai-rules ファイル解析
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
npm run dev

# 本番ビルド（tsup使用）
npm run build

# リンターとフォーマッター（Biome使用）
npm run lint
npm run format

# テスト
npm run test

# パッケージ公開
npm publish
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

## 使用例

```bash
# プロジェクト初期化
cd my-project
ai-rules init

# .ai-rules/coding-rules.md を編集
vim .ai-rules/coding-rules.md

# 設定ファイル生成
ai-rules generate

# 結果確認
ls copilot-instructions.md
ls .cursor/rules/
ls .clinerules/
```