# rulesync

[![CI](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml/badge.svg)](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rulesync.svg)](https://www.npmjs.com/package/rulesync)

A Node.js CLI tool that automatically generates configuration files for various AI development tools from unified AI rule files (`.rulesync/*.md`).

## Supported Tools

- **GitHub Copilot Custom Instructions** (`.github/instructions/*.instructions.md`)
- **Cursor Project Rules** (`.cursor/rules/*.md`) 
- **Cline Rules** (`.clinerules/*.md`)
- **Claude Code Memory** (`./CLAUDE.md`)

## Installation

```bash
npm install -g rulesync
# or
pnpm add -g rulesync
# or  
yarn global add rulesync
```

## Usage

### 1. Initialize

```bash
rulesync init
```

This creates a `.rulesync/` directory with sample rule files.

### 2. Edit Rule Files

Define metadata in front matter for each Markdown file:

```markdown
---
ruleLevel: overview # or detail
targets: ["*"] # or [copilot, cursor, cline, claudecode]
description: "TypeScript coding rules"
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Rules

- Use TypeScript
- Write clear type annotations
```

### Rule Levels

- **overview**: Project-wide overview and policies (only one file allowed)
- **detail**: Specific implementation rules and detailed guidelines (multiple files allowed)

Each tool handles rule levels differently:
- **Claude Code**: overview → `CLAUDE.md`, detail → `.claude/memories/*.md`
- **Cursor**: overview → `ruletype: always`, detail → `ruletype: autoattached`

### 3. Generate Configuration Files

```bash
# Generate for all tools
rulesync generate

# Generate for specific tools
rulesync generate --copilot
rulesync generate --cursor  
rulesync generate --cline
rulesync generate --claude
```

### 4. Other Commands

```bash
# Validate configuration
rulesync validate

# Check current status
rulesync status

# Watch files and auto-generate
rulesync watch
```

## Configuration File Structure

```
.rulesync/
├── coding-rules.md      # Coding rules
├── naming-conventions.md # Naming conventions
├── architecture.md      # Architecture guidelines
├── security.md          # Security rules
└── custom.md           # Project-specific rules
```

## Generated Configuration Files

| Tool | Output Path | Format |
|------|------------|--------|
| GitHub Copilot | `.github/instructions/*.instructions.md` | Front Matter + Markdown |
| Cursor | `.cursor/rules/*.md` | MDC (YAML header + Markdown) |
| Cline | `.clinerules/*.md` | Plain Markdown |
| Claude Code | `./CLAUDE.md` (overview), `.claude/memories/*.md` (detail) | Plain Markdown |

## Development

```bash
# Install dependencies
pnpm install

# Development run
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Code quality checks
pnpm lint
pnpm format
pnpm secretlint
```

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

For detailed specifications, see [SPECIFICATION.md](./SPECIFICATION.md).