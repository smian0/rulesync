---
root: false
targets: ['*']
description: "AI rule specifications for each vendor"
globs: []
---

# Each vendor rules specifications

## GitHub Copilot Custom Instructions

https://code.visualstudio.com/docs/copilot/copilot-customization

### Overview
A mechanism to provide custom instructions to GitHub Copilot in VS Code. Automatically applied to chat requests.

### File Format
- **Workspace**: `.github/copilot-instructions.md`
  - Automatically applied to all chat requests
  - Requires `github.copilot.chat.codeGeneration.useInstructionFiles` setting
- **Project**: `.github/instructions/*.instructions.md`
  - Can specify file application scope with glob patterns
  - Can reference other instruction files

### File Structure
```markdown
---
description: "Brief file description"
applyTo: "**"  # Glob pattern
---

Natural language instruction content
```

### Features
- Combine instructions from multiple files
- Support variables like `${workspaceFolder}`
- Not used in code completion (chat only)

### Best Practices
- Keep instructions short and specific
- Avoid references to external resources
- Split into multiple files by functionality

## Cursor Project Rules

https://docs.cursor.com/context/rules

### Overview
A mechanism to provide project-specific rules and context to Cursor's AI model.

### File Format
- **Location**: `.cursor/rules/` directory
- **Extension**: `.mdc` (Markdown with Context)
- Nested `.cursor/rules` in subdirectories is also possible

### Rule Types
1. **Always**: Always included in model context
2. **Auto Attached**: Applied when files matching glob pattern are referenced
3. **Agent Requested**: Applied when AI determines it's needed (description required)
4. **Manual**: Applied only when explicitly referenced with `@ruleName`

### File Structure
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

### Features
- Can reference additional files with `@filename`
- Support project-wide and subdirectory-specific rules
- Used for recording domain knowledge, workflow automation, and coding standardization

### Best Practices
- Keep rules concise (500 lines or less recommended)
- Split large concepts into multiple rules
- Include specific examples

## Cline Rules

https://docs.cline.bot/features/cline-rules

### Overview
A mechanism to provide "system-level guidance" to Cline projects and conversations.

### File Format
- **Location**: `.clinerules/` directory or `Documents/Cline/Rules`
- **File Format**: Markdown files

### Creation Methods
1. Click the "+" button in Rules tab
2. Use `/newrule` slash command in chat
3. Manually create Markdown files

### File Structure Best Practices
- Use clear and concise language
- Focus on expected results
- Organize rules by concern (e.g., documentation, coding standards)
- Control file order with numeric prefixes (optional)

### Folder System Features
- Support multiple rule files within `.clinerules/`
- Can maintain inactive rule sets as "rules bank"
- Support context-specific rule activation
- Easy switching between project contexts

### Advanced Management Features
- Cline v3.13 introduces toggleable popover UI
- Instant display and switching of active rules
- Quick rule file creation and management functionality

### Implementation Tips
- Individual rule files should be focused
- Use descriptive file names
- Consider git-ignoring active `.clinerules/` folder
- Create team scripts for rule combinations

## Roo Code Rules

https://docs.roocode.com/features/custom-instructions

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
