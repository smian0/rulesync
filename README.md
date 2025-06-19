# rulesync

[![CI](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml/badge.svg)](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rulesync.svg)](https://www.npmjs.com/package/rulesync)

A Node.js CLI tool that automatically generates configuration files for various AI development tools from unified AI rule files (`.rulesync/*.md`).

## Supported Tools

- **GitHub Copilot Custom Instructions** (`.github/instructions/*.instructions.md`)
- **Cursor Project Rules** (`.cursor/rules/*.md`) 
- **Cline Rules** (`.clinerules/*.md`)
- **Claude Code Memory** (`./CLAUDE.md` + `.claude/memories/*.md`)

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
root: true # or false
targets: ["*"] # or [copilot, cursor, cline, claudecode]
description: "TypeScript coding rules"
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Rules

- Use TypeScript
- Write clear type annotations
```

### Rule Levels

rulesync uses a two-level rule system:

- **overview**: Project-wide overview and policies
  - Only **one** overview file is allowed per project
  - Contains high-level guidelines and project context
- **detail**: Specific implementation rules and detailed guidelines
  - Multiple detail files are allowed
  - Contains specific coding rules, naming conventions, etc.

#### Tool-Specific Behavior

Each AI tool handles rule levels differently:

| Tool | Overview Rules | Detail Rules | Special Behavior |
|------|---------------|--------------|------------------|
| **Claude Code** | `./CLAUDE.md` | `.claude/memories/*.md` | CLAUDE.md includes `@filename` references to detail files |
| **Cursor** | `ruletype: always` | `ruletype: autoattached` | Detail rules without globs use `ruletype: agentrequested` |
| **GitHub Copilot** | Standard format | Standard format | All rules use same format with frontmatter |
| **Cline** | Standard format | Standard format | All rules use plain Markdown format |

### 3. Generate Configuration Files

```bash
# Generate for all tools
rulesync generate

# Generate for specific tools
rulesync generate --copilot
rulesync generate --cursor  
rulesync generate --cline
rulesync generate --claude

# Clean build (delete existing files first)
rulesync generate --delete

# Clean build for specific tools
rulesync generate --copilot --cursor --delete

# Verbose output
rulesync generate --verbose
rulesync generate --delete --verbose
```

#### Generate Options

- `--delete`: Remove all existing generated files before creating new ones
- `--verbose`: Show detailed output during generation process
- `--copilot`, `--cursor`, `--cline`, `--claude`: Generate only for specified tools

### 4. Other Commands

```bash
# Initialize project with sample files
rulesync init

# Validate rule files
rulesync validate

# Check current status  
rulesync status

# Watch files and auto-generate
rulesync watch

# Add generated files to .gitignore
rulesync gitignore
```

## Configuration File Structure

```
.rulesync/
├── overview.md          # Project overview (required, only one)
├── coding-rules.md      # Coding rules (detail)
├── naming-conventions.md # Naming conventions (detail)
├── architecture.md      # Architecture guidelines (detail)  
├── security.md          # Security rules (detail)
└── custom.md           # Project-specific rules (detail)
```

### Frontmatter Schema

Each rule file must include frontmatter with the following fields:

```yaml
---
ruleLevel: overview | detail  # Required: Rule level
targets: ["*"]               # Required: Target tools (* = all, or specific tools)
description: "Brief description"  # Required: Rule description
globs: ["**/*.ts", "**/*.js"]    # Required: File patterns (can be empty array)
---
```

### Example Files

**Overview file** (`.rulesync/overview.md`):
```markdown
---
ruleLevel: overview
targets: ["*"]
description: "Project overview and development philosophy"
globs: ["src/**/*.ts"]
---

# Project Development Guidelines

This project follows TypeScript-first development with clean architecture principles.
```

**Detail file** (`.rulesync/coding-rules.md`):
```markdown
---
ruleLevel: detail
targets: ["copilot", "cursor"]
description: "TypeScript coding standards"
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Coding Rules

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable names
```

## Generated Configuration Files

| Tool | Output Path | Format | Rule Level Handling |
|------|------------|--------|-------------------|
| **GitHub Copilot** | `.github/instructions/*.instructions.md` | Front Matter + Markdown | Both levels use same format |
| **Cursor** | `.cursor/rules/*.md` | MDC (YAML header + Markdown) | Overview: `ruletype: always`<br>Detail: `ruletype: autoattached`<br>Detail without globs: `ruletype: agentrequested` |
| **Cline** | `.clinerules/*.md` | Plain Markdown | Both levels use same format |
| **Claude Code** | `./CLAUDE.md` (overview)<br>`.claude/memories/*.md` (detail) | Plain Markdown | Overview goes to CLAUDE.md<br>Details go to separate memory files<br>CLAUDE.md includes `@filename` references |

## Validation

rulesync validates your rule files and provides helpful error messages:

```bash
rulesync validate
```

Common validation rules:
- Only one overview file is allowed per project
- All frontmatter fields are required and properly formatted
- File patterns (globs) use valid syntax
- Target tools are recognized values

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

For development setup and contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).