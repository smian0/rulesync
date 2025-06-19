---
root: false
targets: ['*']
description: "ファイル生成とMarkdown処理のベストプラクティス"
globs: ["src/generators/**/*.ts", "src/core/parser.ts", "src/utils/file.ts"]
---

# ファイル生成とMarkdown処理

## gray-matter処理

### Frontmatter解析
- YAML frontmatterのみサポート
- 必須フィールドの検証を実装
- 型安全な解析結果を保証

### 検証ルール
- `root`: boolean型、必須
- `targets`: 配列型、"*"または有効なツール名のみ
- `description`: 非空文字列、必須
- `globs`: 文字列配列、空配列も許可

## 各ツールの生成規約

### GitHub Copilot
- `.github/instructions/`ディレクトリに出力
- ファイル名：`{ルール名}.instructions.md`
- frontmatterの`applyTo`フィールドでglobパターン指定

### Cursor
- `.cursor/rules/`ディレクトリに出力
- ファイル名：`{ルール名}.md`
- 本文内で追加ファイル参照（`@filename`）の使用可能

### Cline
- `.clinerules/`ディレクトリに出力
- ファイル名：`{ルール名}.md`
- プレーンMarkdown形式

### Claude Code
- `CLAUDE.md`への統合形式
- `@{ルール名}`でインポート可能な形式

## ファイルI/O規約

### ディレクトリ作成
- 出力先ディレクトリが存在しない場合は自動作成
- 権限エラーを適切にハンドリング

### 文字エンコーディング
- UTF-8エンコーディングを使用
- 改行コードはLF（\n）に統一

### 原子的操作
- 一時ファイルに書き込み後、リネームで原子的更新
- 書き込み失敗時の部分更新を防止

### バックアップ
- 既存ファイルを上書きする際のバックアップは作成しない
- Gitによるバージョン管理を前提