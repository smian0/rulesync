---
root: true
targets: ['*']
description: "rulesyncプロジェクトの概要とアーキテクチャガイド"
globs: ["src/**/*.ts"]
---

# rulesyncプロジェクト概要

rulesyncは複数のAI開発ツール（GitHub Copilot、Cursor、Cline、Claude Code）に対応した統一AI設定管理CLIツールです。

## 核心アーキテクチャ

### 主要コンポーネント
- **CLI エントリーポイント**: `src/cli/index.ts` - Commander.jsを使用
- **コアパース処理**: `src/core/parser.ts` - gray-matterでfrontmatter処理
- **生成エンジン**: `src/core/generator.ts` - ツール別設定ファイル生成の統括
- **ツール特化ジェネレータ**: `src/generators/` - 各AIツール向けのMarkdown生成

### 設計パターン
- **TypeScript strict mode**: `noUncheckedIndexedAccess`と`exactOptionalPropertyTypes`を有効化
- **ESMとCJS二重出力**: tsupでdist/index.js（CJS）とdist/index.mjs（ESM）を生成
- **関数型アプローチ**: 純粋関数を優先し、副作用を最小限に抑制
- **エラーハンドリング**: 具体的なエラーメッセージと型安全性を重視

### 入力データ構造
```typescript
type RuleFrontmatter = {
  root: boolean;           // ルートレベルかどうか
  targets: ["*"] | ToolTarget[]; // 対象ツール指定
  description: string;     // ルールの簡潔な説明
  globs: string[];        // 適用ファイルパターン
}
```
