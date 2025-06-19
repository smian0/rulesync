# rulesync

[![CI](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml/badge.svg)](https://github.com/dyoshikawa/rulesync/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/rulesync.svg)](https://www.npmjs.com/package/rulesync)

A Node.js CLI tool that automatically generates configuration files for various AI development tools from unified AI rule files (`.rulesync/*.md`).

## Supported Tools

- **GitHub Copilot Custom Instructions** (`.github/instructions/*.instructions.md`)
- **Cursor Project Rules** (`.cursor/rules/*.mdc`) 
- **Cline Rules** (`.clinerules/*.md`)
- **Claude Code Memory** (`./CLAUDE.md` + `.claude/memories/*.md`)
- **Roo Code Rules** (`.roo/rules/*.md`)

## Installation

```bash
npm install -g rulesync
# or
pnpm add -g rulesync
# or  
yarn global add rulesync
```

## Getting Started

1. **Initialize your project:**
   ```bash
   npx rulesync init
   ```

2. **Edit the generated rule files** in `.rulesync/` directory to match your project needs

3. **Generate tool-specific configuration files:**
   ```bash
   npx rulesync generate
   ```

4. **Optional: Add generated files to .gitignore:**
   ```bash
   npx rulesync gitignore
   ```

That's it! Your AI coding assistants will now use the generated configuration files automatically.

## Why rulesync?

### 🔧 **Tool Flexibility**
Team members can freely choose their preferred AI coding tools. Whether it's GitHub Copilot, Cursor, Cline, or Claude Code, each developer can use the tool that maximizes their productivity.

### 📈 **Future-Proof Development**
AI development tools evolve rapidly with new tools emerging frequently. With rulesync, switching between tools doesn't require redefining your rules from scratch.

### 🎯 **Multi-Tool Workflow**
Enable hybrid development workflows combining multiple AI tools:
- GitHub Copilot for code completion
- Cursor for refactoring
- Claude Code for architecture design
- Cline for debugging assistance

### 🔓 **No Vendor Lock-in**
Avoid vendor lock-in completely. If you decide to stop using rulesync, you can continue using the generated rule files (`.github/instructions/`, `.cursor/rules/`, `.clinerules/`, `CLAUDE.md`, etc.) as-is.

### 🎯 **Consistency Across Tools**
Apply consistent rules across all AI tools, improving code quality and development experience for the entire team.

## Claude Code Integration

### Creating Custom Slash Commands

Instead of using Claude Code's built-in `/init` command, we recommend creating a custom slash command specifically for rulesync.

Refer to the [Claude Code slash commands documentation](https://docs.anthropic.com/en/docs/claude-code/slash-commands) and add the following custom command:

**`.claude/commands/init-rulesync.md`**

```markdown
Review this project's content and update .rulesync/*.md files as needed.

Steps:
1. Analyze project structure and codebase
2. Review existing .rulesync/ files
3. Consider project's tech stack, architecture, and coding conventions
4. Update .rulesync/*.md files if missing elements or improvements are found
5. Run rulesync generate if necessary

Project characteristics to consider:
- Technology stack
- Architecture patterns
- Coding conventions
- Security requirements
- Performance considerations
```

### Integration Benefits

- **Project-Specific Initialization**: Optimized rule configuration for each project
- **Automatic Rule Updates**: Rules adapt to project changes automatically
- **Team Standardization**: All members use the same rule set
- **Continuous Improvement**: Rules evolve with project growth

## Usage

### 1. Initialize

```bash
npx rulesync init
```

This creates a `.rulesync/` directory with sample rule files.

### 2. Edit Rule Files

Define metadata in front matter for each Markdown file in the `.rulesync/` directory. See the [Example Files](#example-files) section below for detailed examples.

### Rule Levels

rulesync uses a two-level rule system:

- **root: true**: Project-wide overview and policies
  - Only **one** root file is allowed per project
  - Contains high-level guidelines and project context
- **root: false**: Specific implementation rules and detailed guidelines
  - Multiple non-root files are allowed
  - Contains specific coding rules, naming conventions, etc.

#### Tool-Specific Behavior

Each AI tool handles rule levels differently:

| Tool | Root Rules | Non-Root Rules | Special Behavior |
|------|------------|----------------|------------------|
| **Claude Code** | `./CLAUDE.md` | `.claude/memories/*.md` | CLAUDE.md includes `@filename` references to detail files |
| **Cursor** | `ruletype: always` | `ruletype: autoattached` | Detail rules without globs use `ruletype: agentrequested` |
| **GitHub Copilot** | Standard format | Standard format | All rules use same format with frontmatter |
| **Cline** | Standard format | Standard format | All rules use plain Markdown format |
| **Roo Code** | Standard format | Standard format | All rules use plain Markdown format with description header |

### 3. Generate Configuration Files

```bash
# Generate for all tools
npx rulesync generate

# Generate for specific tools
npx rulesync generate --copilot
npx rulesync generate --cursor  
npx rulesync generate --cline
npx rulesync generate --claude
npx rulesync generate --roo

# Clean build (delete existing files first)
npx rulesync generate --delete

# Clean build for specific tools
npx rulesync generate --copilot --cursor --delete

# Verbose output
npx rulesync generate --verbose
npx rulesync generate --delete --verbose
```

#### Generate Options

- `--delete`: Remove all existing generated files before creating new ones
- `--verbose`: Show detailed output during generation process
- `--copilot`, `--cursor`, `--cline`, `--claude`, `--roo`: Generate only for specified tools

### 4. Other Commands

```bash
# Initialize project with sample files
npx rulesync init

# Validate rule files
npx rulesync validate

# Check current status  
npx rulesync status

# Watch files and auto-generate
npx rulesync watch

# Add generated files to .gitignore
npx rulesync gitignore
```

## Configuration File Structure

```
.rulesync/
├── overview.md          # Project overview (root: true, only one)
├── coding-rules.md      # Coding rules (root: false)
├── naming-conventions.md # Naming conventions (root: false)
├── architecture.md      # Architecture guidelines (root: false)  
├── security.md          # Security rules (root: false)
└── custom.md           # Project-specific rules (root: false)
```

### Frontmatter Schema

Each rule file must include frontmatter with the following fields:

```yaml
---
root: true | false               # Required: Rule level (true for overview, false for details)
targets: ["*"]                   # Required: Target tools (* = all, or specific tools)
description: "Brief description" # Required: Rule description
globs: ["**/*.ts", "**/*.js"]    # Required: File patterns (can be empty array)
---
```

### Example Files

**Root file** (`.rulesync/overview.md`):
```markdown
---
root: true
targets: ["*"]
description: "Project overview and development philosophy"
globs: ["src/**/*.ts"]
---

# Project Development Guidelines

This project follows TypeScript-first development with clean architecture principles.
```

**Non-root file** (`.rulesync/coding-rules.md`):
```markdown
---
root: false
targets: ["copilot", "cursor", "roo"]
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
| **Cursor** | `.cursor/rules/*.mdc` | MDC (YAML header + Markdown) | Root: `ruletype: always`<br>Non-root: `ruletype: autoattached`<br>Non-root without globs: `ruletype: agentrequested` |
| **Cline** | `.clinerules/*.md` | Plain Markdown | Both levels use same format |
| **Claude Code** | `./CLAUDE.md` (root)<br>`.claude/memories/*.md` (non-root) | Plain Markdown | Root goes to CLAUDE.md<br>Non-root go to separate memory files<br>CLAUDE.md includes `@filename` references |
| **Roo Code** | `.roo/rules/*.md` | Plain Markdown | Both levels use same format with description header |

## Validation

rulesync validates your rule files and provides helpful error messages:

```bash
npx rulesync validate
```

Common validation rules:
- Only one root file (root: true) is allowed per project
- All frontmatter fields are required and properly formatted
- File patterns (globs) use valid syntax
- Target tools are recognized values

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

For development setup and contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).