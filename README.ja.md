# rulesync

[![CI](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml/badge.svg)](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rulesync.svg)](https://www.npmjs.com/package/rulesync)

統一されたAIルールファイル（`.rulesync/*.md`）から、様々なAI開発ツール用の設定ファイルを自動生成するNode.js CLIツールです。既存のAIツール設定を統一形式にインポートすることも可能です。

[English](./README.md) | **日本語**

## 対応ツール

rulesyncは以下のAI開発ツールの**生成**と**インポート**の両方をサポートしています：

- **GitHub Copilot Custom Instructions** (`.github/copilot-instructions.md` + `.github/instructions/*.instructions.md`)
- **Cursor Project Rules** (`.cursor/rules/*.mdc` + `.cursorrules`) 
- **Cline Rules** (`.clinerules/*.md` + `.cline/instructions.md`)
- **Claude Code Memory** (`./CLAUDE.md` + `.claude/memories/*.md`)
- **Roo Code Rules** (`.roo/rules/*.md` + `.roo/instructions.md`)
- **Gemini CLI** (`GEMINI.md` + `.gemini/memories/*.md`)

## インストール

```bash
npm install -g rulesync
# または
pnpm add -g rulesync
# または  
yarn global add rulesync
```

## 使い始める

### 新しいプロジェクト

1. **プロジェクトを初期化:**
   ```bash
   npx rulesync init
   ```

2. **`.rulesync/`ディレクトリの生成されたルールファイル**をプロジェクトのニーズに合わせて編集します
   
   または新しいルールファイルを追加:
   ```bash
   npx rulesync add my-custom-rules
   ```

3. **ツール固有の設定ファイルを生成:**
   ```bash
   npx rulesync generate
   ```

4. **オプション: 生成されたファイルを.gitignoreに追加:**
   ```bash
   npx rulesync gitignore
   ```

### AIツール設定を持つ既存プロジェクト

既にAIツールの設定がある場合、それらをrulesync形式にインポートできます：

1. **既存設定をインポート:**
   ```bash
   # 複数のツールから一度にインポート
   npx rulesync import --claudecode --cursor --copilot
   
   # または特定のツールからインポート
   npx rulesync import --claudecode  # CLAUDE.mdと.claude/memories/*.mdから
   npx rulesync import --cursor      # .cursorrulesと.cursor/rules/*.mdcから
   npx rulesync import --copilot     # .github/copilot-instructions.mdから
   npx rulesync import --cline       # .cline/instructions.mdから
   npx rulesync import --roo         # .roo/instructions.mdから
   npx rulesync import --geminicli   # GEMINI.mdと.gemini/memories/*.mdから
   ```

2. **`.rulesync/`ディレクトリのインポートされたルールを確認・編集**

3. **統合された設定を生成:**
   ```bash
   npx rulesync generate
   ```

以上です！AIコーディングアシスタントが生成された設定ファイルを自動的に使用するようになります。

## rulesyncを使う理由

### 🔧 **ツールの柔軟性**
チームメンバーは好みのAIコーディングツールを自由に選択できます。GitHub Copilot、Cursor、Cline、Claude Codeのいずれであっても、各開発者は生産性を最大化するツールを使用できます。

### 📈 **将来を見据えた開発**
AI開発ツールは新しいツールが頻繁に登場し、急速に進化しています。rulesyncがあれば、ツールを切り替える際にルールを一から再定義する必要がありません。

### 🎯 **マルチツールワークフロー**
複数のAIツールを組み合わせたハイブリッド開発ワークフローを可能にします：
- GitHub Copilot：コード補完
- Cursor：リファクタリング
- Claude Code：アーキテクチャ設計
- Cline：デバッグ支援
- Gemini CLI：知的コード解析

### 🔓 **ベンダーロックインなし**
ベンダーロックインを完全に回避できます。rulesyncの使用を停止することを決定した場合でも、生成されたルールファイル（`.github/instructions/`、`.cursor/rules/`、`.clinerules/`、`CLAUDE.md`、`GEMINI.md`など）をそのまま使い続けることができます。

### 🎯 **ツール間の一貫性**
すべてのAIツールに一貫したルールを適用し、チーム全体のコード品質と開発体験を向上させます。

## Claude Code統合

### カスタムスラッシュコマンドの作成

Claude Codeの組み込み`/init`コマンドを使用する代わりに、rulesync専用のカスタムスラッシュコマンドを作成することをお勧めします。

[Claude Codeスラッシュコマンドドキュメント](https://docs.anthropic.com/en/docs/claude-code/slash-commands)を参照し、以下のカスタムコマンドを追加してください：

**`.claude/commands/init-rulesync.md`**

```markdown
このプロジェクトの内容を確認し、必要に応じて.rulesync/*.mdファイルを更新してください。

手順:
1. プロジェクト構造とコードベースを分析
2. 既存の.rulesync/ファイルを確認
3. プロジェクトの技術スタック、アーキテクチャ、コーディング規約を考慮
4. 不足している要素や改善点が見つかった場合は.rulesync/*.mdファイルを更新
5. 必要に応じてrulesync generateを実行

考慮すべきプロジェクトの特徴:
- 技術スタック
- アーキテクチャパターン
- コーディング規約
- セキュリティ要件
- パフォーマンスの考慮事項
```

### 統合のメリット

- **プロジェクト固有の初期化**: 各プロジェクトに最適化されたルール設定
- **自動ルール更新**: プロジェクトの変更に応じてルールが自動的に適応
- **チーム標準化**: すべてのメンバーが同じルールセットを使用
- **継続的改善**: プロジェクトの成長とともにルールが進化

## 使用方法

### 1. 初期化

```bash
npx rulesync init
```

これにより、サンプルルールファイルを含む`.rulesync/`ディレクトリが作成されます。

### 2. ルールファイルの編集

`.rulesync/`ディレクトリ内の各Markdownファイルでメタデータをフロントマターで定義します。詳細な例については、下記の[ファイル例](#ファイル例)セクションを参照してください。

### ルールレベル

rulesyncは2レベルのルールシステムを使用します：

- **root: true**: プロジェクト全体の概要とポリシー
  - プロジェクトごとに**1つ**のrootファイルのみ許可
  - 高レベルのガイドラインとプロジェクトコンテキストを含む
- **root: false**: 具体的な実装ルールと詳細なガイドライン
  - 複数の非rootファイルが許可
  - 具体的なコーディングルール、命名規約などを含む

#### ツール固有の動作

各AIツールはルールレベルを異なって処理します：

| ツール | ルートルール | 非ルートルール | 特別な動作 |
|------|------------|----------------|------------------|
| **Claude Code** | `./CLAUDE.md` | `.claude/memories/*.md` | CLAUDE.mdが詳細ファイルへの`@filename`参照を含む |
| **Cursor** | `ruletype: always` | `ruletype: autoattached` | globsのない詳細ルールは`ruletype: agentrequested`を使用 |
| **GitHub Copilot** | 標準フォーマット | 標準フォーマット | すべてのルールがフロントマター付きの同じフォーマットを使用 |
| **Cline** | 標準フォーマット | 標準フォーマット | すべてのルールがプレーンMarkdownフォーマットを使用 |
| **Roo Code** | 標準フォーマット | 標準フォーマット | すべてのルールが説明ヘッダー付きのプレーンMarkdownフォーマットを使用 |
| **Gemini CLI** | `GEMINI.md` | `.gemini/memories/*.md` | GEMINI.mdがメモリファイルへの`@filename`参照を含む |

### 3. 設定ファイルの生成

```bash
# すべてのツール用に生成
npx rulesync generate

# 特定のツール用に生成
npx rulesync generate --copilot
npx rulesync generate --cursor  
npx rulesync generate --cline
npx rulesync generate --claudecode
npx rulesync generate --roo
npx rulesync generate --geminicli

# クリーンビルド（既存ファイルを最初に削除）
npx rulesync generate --delete

# 特定ツール用のクリーンビルド
npx rulesync generate --copilot --cursor --delete

# 詳細出力
npx rulesync generate --verbose
npx rulesync generate --delete --verbose

# 特定のベースディレクトリに生成（monorepoサポート）
npx rulesync generate --base-dir ./packages/frontend
npx rulesync generate --base-dir ./packages/frontend,./packages/backend
npx rulesync generate --base-dir ./apps/web,./apps/api,./packages/shared
```

#### 生成オプション

- `--delete`: 新しいファイルを作成する前に既存の生成済みファイルをすべて削除
- `--verbose`: 生成プロセス中に詳細出力を表示
- `--copilot`, `--cursor`, `--cline`, `--claudecode`, `--roo`, `--geminicli`: 指定されたツールのみ生成
- `--base-dir <paths>`: 指定されたベースディレクトリに設定ファイルを生成（複数パスの場合はカンマ区切り）。異なるプロジェクトディレクトリにツール固有の設定を生成したいmonorepoセットアップに便利。

### 4. 既存設定のインポート

プロジェクトに既存のAIツール設定がある場合、rulesync形式にインポートできます：

```bash
# 既存のAIツール設定からインポート
npx rulesync import --claudecode # CLAUDE.mdと.claude/memories/*.mdからインポート
npx rulesync import --cursor     # .cursorrulesと.cursor/rules/*.mdからインポート
npx rulesync import --copilot    # .github/copilot-instructions.mdと.github/instructions/*.instructions.mdからインポート
npx rulesync import --cline      # .cline/instructions.mdからインポート
npx rulesync import --roo        # .roo/instructions.mdからインポート
npx rulesync import --geminicli  # GEMINI.mdと.gemini/memories/*.mdからインポート

# 複数のツールからインポート
npx rulesync import --claudecode --cursor --copilot

# インポート時の詳細出力
npx rulesync import --claudecode --verbose
```

importコマンドの動作：
- カスタムパーサーを使用して各AIツールの既存設定ファイルをパース
- 適切なフロントマターメタデータを付けてrulesync形式に変換
- インポートしたコンテンツと適切なルール分類で新しい`.rulesync/*.md`ファイルを作成
- ファイル名の競合を避けるためツール固有のプレフィックスを使用（例：`claudecode-overview.md`、`cursor-custom-rules.md`）
- 競合が発生した場合はユニークなファイル名を生成
- YAMLフロントマター付きのCursorのMDCファイルなど複雑なフォーマットをサポート
- 複数ファイルのインポート（例：`.claude/memories/`ディレクトリのすべてのファイル）に対応

### 5. その他のコマンド

```bash
# サンプルファイルでプロジェクトを初期化
npx rulesync init

# 新しいルールファイルを追加
npx rulesync add <filename>
npx rulesync add typescript-rules
npx rulesync add security.md  # .md拡張子は自動的に処理される

# ルールファイルを検証
npx rulesync validate

# 現在のステータスを確認  
npx rulesync status

# ファイルを監視して自動生成
npx rulesync watch

# 生成されたファイルを.gitignoreに追加
npx rulesync gitignore
```

## 設定ファイル構造

```
.rulesync/
├── overview.md          # プロジェクト概要 (root: true, 1つのみ)
├── coding-rules.md      # コーディングルール (root: false)
├── naming-conventions.md # 命名規約 (root: false)
├── architecture.md      # アーキテクチャガイドライン (root: false)  
├── security.md          # セキュリティルール (root: false)
└── custom.md           # プロジェクト固有ルール (root: false)
```

### フロントマタースキーマ

各ルールファイルには以下のフィールドを含むフロントマターが必要です：

```yaml
---
root: true | false               # 必須: ルールレベル (概要の場合true、詳細の場合false)
targets: ["*"]                   # 必須: ターゲットツール (* = すべて、または特定のツール)
description: "簡潔な説明"        # 必須: ルールの説明
globs: "**/*.ts,**/*.js"          # 必須: ファイルパターン (カンマ区切りまたは空文字列)
---
```

### ファイル例

**ルートファイル** (`.rulesync/overview.md`):
```markdown
---
root: true
targets: ["*"]
description: "プロジェクト概要と開発思想"
globs: "src/**/*.ts"
---

# プロジェクト開発ガイドライン

このプロジェクトはクリーンアーキテクチャの原則に従ったTypeScript-firstの開発を行っています。
```

**非ルートファイル** (`.rulesync/coding-rules.md`):
```markdown
---
root: false
targets: ["copilot", "cursor", "roo"]
description: "TypeScriptコーディング標準"
globs: "**/*.ts,**/*.tsx"
---

# TypeScriptコーディングルール

- 厳密なTypeScript設定を使用
- オブジェクト形状にはtypeよりinterfaceを優先
- 意味のある変数名を使用
```

## 生成される設定ファイル

| ツール | 出力パス | フォーマット | ルールレベル処理 |
|------|------------|--------|-------------------|
| **GitHub Copilot** | `.github/instructions/*.instructions.md` | フロントマター + Markdown | 両レベルとも同じフォーマットを使用 |
| **Cursor** | `.cursor/rules/*.mdc` | MDC (YAMLヘッダー + Markdown) | ルート: `ruletype: always`<br>非ルート: `ruletype: autoattached`<br>globsなしの非ルート: `ruletype: agentrequested` |
| **Cline** | `.clinerules/*.md` | プレーンMarkdown | 両レベルとも同じフォーマットを使用 |
| **Claude Code** | `./CLAUDE.md` (ルート)<br>`.claude/memories/*.md` (非ルート) | プレーンMarkdown | ルートはCLAUDE.mdに移動<br>非ルートは別メモリファイルに移動<br>CLAUDE.mdは`@filename`参照を含む |
| **Roo Code** | `.roo/rules/*.md` | プレーンMarkdown | 両レベルとも説明ヘッダー付きの同じフォーマットを使用 |
| **Gemini CLI** | `GEMINI.md` (ルート)<br>`.gemini/memories/*.md` (非ルート) | プレーンMarkdown | ルートはGEMINI.mdに移動<br>非ルートは別メモリファイルに移動<br>GEMINI.mdは`@filename`参照を含む |

## バリデーション

rulesyncはルールファイルを検証し、有用なエラーメッセージを提供します：

```bash
npx rulesync validate
```

一般的なバリデーションルール：
- プロジェクトごとに1つのルートファイル（root: true）のみ許可
- すべてのフロントマターフィールドが必須で適切にフォーマットされている
- ファイルパターン（globs）が有効な構文を使用
- ターゲットツールが認識される値である

## ライセンス

MIT License

## 貢献

Issues と Pull Requests を歓迎します！

開発環境の設定と貢献ガイドラインについては、[CONTRIBUTING.ja.md](./CONTRIBUTING.ja.md)を参照してください。