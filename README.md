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

## Getting Started

### Quick Start Example

1. **Initialize your project:**
   ```bash
   rulesync init
   ```

2. **Create an overview file** (`.rulesync/overview.md`):
   ```markdown
   ---
   root: true
   targets: ["*"]
   description: "Project overview and development philosophy"
   globs: ["src/**/*.ts", "src/**/*.js"]
   ---

   # Project Development Guidelines

   This is a TypeScript/JavaScript project following clean architecture principles.
   We prioritize code readability, maintainability, and type safety.

   ## Tech Stack
   - TypeScript for type safety
   - Node.js runtime
   - Modern ES6+ features
   ```

3. **Create detail rules** (`.rulesync/coding-rules.md`):
   ```markdown
   ---
   root: false
   targets: ["copilot", "cursor", "cline"]
   description: "TypeScript coding standards and best practices"
   globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
   ---

   # TypeScript Coding Rules

   ## Code Style
   - Use strict TypeScript configuration
   - Prefer `const` over `let` when possible
   - Use meaningful, descriptive variable names
   - Write JSDoc comments for public APIs

   ## Type Definitions
   - Prefer interfaces over types for object shapes
   - Use union types for controlled values
   - Avoid `any` type - use `unknown` instead
   - Define return types for functions explicitly

   ## Error Handling
   - Use Result pattern for error handling
   - Throw errors only for unexpected conditions
   - Validate input parameters at function boundaries
   ```

4. **Generate configuration files:**
   ```bash
   rulesync generate
   ```

5. **Optional: Add generated files to .gitignore:**
   ```bash
   rulesync gitignore
   ```

This will create tool-specific configuration files that your AI coding assistants can use automatically.

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
| **Cursor** | `.cursor/rules/*.md` | MDC (YAML header + Markdown) | Root: `ruletype: always`<br>Non-root: `ruletype: autoattached`<br>Non-root without globs: `ruletype: agentrequested` |
| **Cline** | `.clinerules/*.md` | Plain Markdown | Both levels use same format |
| **Claude Code** | `./CLAUDE.md` (root)<br>`.claude/memories/*.md` (non-root) | Plain Markdown | Root goes to CLAUDE.md<br>Non-root go to separate memory files<br>CLAUDE.md includes `@filename` references |

## Validation

rulesync validates your rule files and provides helpful error messages:

```bash
rulesync validate
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