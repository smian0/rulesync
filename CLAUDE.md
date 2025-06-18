# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際にClaude Code (claude.ai/code) にガイダンスを提供します。

## プロジェクト概要

rulesyncは、統一されたルールファイル（`.rulesync/*.md`）から、さまざまなAI開発ツール（GitHub Copilot、Cursor、Cline）用の設定ファイルを生成するNode.js CLIツールです。このツールは、異なる開発環境間でのAIルールの一貫性の確保という問題を解決します。

## コアアーキテクチャ

### CLIエントリーポイント
- `src/cli/index.ts` - Commander.jsを使用したメインCLI
- `src/cli/commands/` - 個別のコマンド実装（init、generate、watch、status、validate）

### コア処理
- `src/core/parser.ts` - gray-matterフロントマターで`.rulesync/*.md`ファイルを解析
- `src/core/generator.ts` - ターゲット設定ファイルの生成をオーケストレート
- `src/core/validator.ts` - ルールファイルの構造と内容を検証

### ツール固有ジェネレーター
- `src/generators/copilot.ts` - `.github/instructions/*.instructions.md`を生成
- `src/generators/cursor.ts` - `.cursor/rules/*.md`を生成
- `src/generators/cline.ts` - `.clinerules/*.md`を生成

### 入力形式
`.rulesync/`のルールファイルは以下のフロントマターを使用：
- `priority`: high|low
- `targets`: ["*"] または [copilot, cursor, cline] - "*"はすべてのツールに適用
- `description`: ルールの簡潔な説明
- `globs`: ルールが適用されるファイルパターン（例: ["**/*.ts", "**/*.js"]）

## 開発コマンド

```bash
# ホットリロード付き開発
pnpm dev

# プロダクション用ビルド（CommonJS + ESM）
pnpm build

# コード品質チェック
pnpm lint           # Biomeリント
pnpm format         # Biomeフォーマット
pnpm format:check   # フォーマットチェック
pnpm check          # Biomeリント + フォーマット
pnpm secretlint     # シークレット検出

# テスト
pnpm test           # テスト実行
pnpm test:watch     # ウォッチモード
pnpm test:coverage  # カバレッジレポート
```

## 主要な依存関係

- **Commander.js**: CLIフレームワーク
- **gray-matter**: フロントマター解析
- **marked**: Markdown処理
- **chokidar**: `watch`コマンド用のファイル監視
- **tsup**: バンドリング（CJSとESMの両方を出力）
- **tsx**: 開発用TypeScript実行環境

## ビルドシステム

- Node.js 20.0.0以上が必要（推奨: 24.0.0以上）
- `@tsconfig/node24` ベース設定を使用
- tsupでCommonJS (`dist/index.js`) とESM (`dist/index.mjs`) の両方を出力
- バイナリエントリーポイント: `dist/index.js`
- 型定義ファイルもビルド出力に含まれる

## コード品質ツール

- **Biome**: 統一されたリンター/フォーマッター（`biome.json`で設定）
- **secretlint**: シークレット漏洩防止（`.secretlintrc.json`で設定）
- **TypeScript**: 厳密モードと追加の安全性チェック
- VS Code: `.vscode/settings.json`で保存時自動フォーマット設定済み