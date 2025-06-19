---
root: false
targets: ['*']
description: "各ベンダーのAIルール仕様書"
globs: []
---

# Each vendor rules specifications

## GitHub Copilot Custom Instructions

https://code.visualstudio.com/docs/copilot/copilot-customization#_use-instructionsmd-files

### 概要
VS CodeのGitHub Copilotにカスタム指示を提供する仕組み。チャットリクエストに自動的に適用される。

### ファイル形式
- **ワークスペース用**: `.github/copilot-instructions.md`
  - 全てのチャットリクエストに自動適用
  - `github.copilot.chat.codeGeneration.useInstructionFiles`設定が必要
- **プロジェクト用**: `.github/instructions/*.instructions.md`
  - globパターンでファイル適用範囲を指定可能
  - 他のinstructionファイルを参照可能

### ファイル構造
```markdown
---
description: "Brief file description"
applyTo: "**"  # Glob pattern
---

自然言語による指示内容
```

### 特徴
- 複数ファイルの指示を組み合わせて使用
- `${workspaceFolder}`などの変数をサポート
- コード補完では使用されない（チャットのみ）

### ベストプラクティス
- 指示は短く具体的に
- 外部リソースへの参照は避ける
- 機能別に複数ファイルに分割

## Cursor Project Rules

https://docs.cursor.com/context/rules

### 概要
CursorのAIモデルにプロジェクト固有のルールやコンテキストを提供する仕組み。

### ファイル形式
- **配置場所**: `.cursor/rules/`ディレクトリ
- **拡張子**: `.mdc`（Markdown with Context）
- サブディレクトリにネストした`.cursor/rules`も可能

### ルール種別
1. **Always**: 常にモデルコンテキストに含まれる
2. **Auto Attached**: globパターンに一致するファイルが参照された時に適用
3. **Agent Requested**: AIが必要と判断した時に適用（description必須）
4. **Manual**: `@ruleName`で明示的に参照した時のみ適用

### ファイル構造
```markdown
---
description: "RPC Service boilerplate"
globs: "**/*.rpc.ts"
alwaysApply: false
---

- Use internal RPC pattern when defining services
- Always use snake_case for service names

@service-template.ts
```

### 特徴
- `@filename`で追加ファイルを参照可能
- プロジェクト全体・サブディレクトリ固有のルールをサポート
- ドメイン知識の記録、ワークフロー自動化、コーディング標準化に活用

### ベストプラクティス
- ルールは簡潔に（500行以下推奨）
- 大きな概念は複数ルールに分割
- 具体例を含める

## Cline Rules

https://docs.cline.bot/features/cline-rules

### 概要
Clineプロジェクトやコンバセーションに「システムレベルのガイダンス」を提供する仕組み。

### ファイル形式
- **配置場所**: `.clinerules/`ディレクトリまたは`Documents/Cline/Rules`
- **ファイル形式**: Markdownファイル

### 作成方法
1. Rulesタブの「+」ボタンをクリック
2. チャットで`/newrule`スラッシュコマンドを使用
3. 手動でMarkdownファイルを作成

### ファイル構造のベストプラクティス
- 明確で簡潔な言語を使用
- 期待する結果に焦点を当てる
- 関心事別にルールを整理（例：ドキュメント、コーディング標準）
- 数値プレフィックスでファイル順序を制御（オプション）

### フォルダシステムの特徴
- `.clinerules/`内に複数のルールファイルをサポート
- 非アクティブなルールセットを「rules bank」として維持可能
- コンテキスト固有のルール有効化をサポート
- プロジェクトコンテキスト間の簡単な切り替えが可能

### 高度な管理機能
- Cline v3.13でトグル可能なポップオーバーUIを導入
- アクティブなルールの瞬時表示・切り替えが可能
- クイックルールファイル作成・管理機能

### 実装のヒント
- 個別ルールファイルは焦点を絞る
- 分かりやすいファイル名を使用
- アクティブな`.clinerules/`フォルダのgit-ignoreを検討
- ルール組み合わせ用のチームスクリプトを作成

## Claude Code Memories

https://docs.anthropic.com/en/docs/claude-code/memory

### 概要
Claude Codeにプロジェクトやユーザー固有のコンテキストと指示を提供するメモリシステム。

### メモリの種類
1. **プロジェクトメモリ** (`./CLAUDE.md`): チーム共有のプロジェクト指示
2. **ユーザーメモリ** (`~/.claude/CLAUDE.md`): 全プロジェクト共通の個人設定
3. **プロジェクトメモリ（ローカル）**: 非推奨

### 主要特徴
- Claude Code起動時に自動的にロード
- `@path/to/import`構文で他ファイルをインポート可能
- 相対・絶対パスでのインポートをサポート
- 最大インポート深度は5ホップ

### メモリファイルのベストプラクティス
- 具体的な指示を記載
- 箇条書きを使った構造化Markdownを使用
- 説明的な見出しの下に整理
- 定期的にレビュー・更新

### クイック追加機能
- 行頭の`#`でメモリを素早く追加
- `/memory`コマンドでシステムエディタでメモリファイルを編集

### 検索メカニズム
- 現在の作業ディレクトリからルートまで再帰的に検索
- 特定ファイル領域を読み取る際にサブツリー内のCLAUDE.mdファイルを発見
