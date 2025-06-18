# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

rulesync is a Node.js CLI tool that generates configuration files for various AI development tools (GitHub Copilot, Cursor, Cline) from unified rule files (`.rulesync/*.md`). The tool solves the problem of maintaining consistent AI rules across different development environments.

## Core Architecture

### CLI Entry Point
- `src/cli/index.ts` - Main CLI using Commander.js
- `src/cli/commands/` - Individual command implementations (init, generate, watch, status, validate)

### Core Processing
- `src/core/parser.ts` - Parses `.rulesync/*.md` files with gray-matter frontmatter
- `src/core/generator.ts` - Orchestrates generation of target configuration files
- `src/core/validator.ts` - Validates rule file structure and content

### Tool-Specific Generators
- `src/generators/copilot.ts` - Generates `.github/instructions/*.instructions.md`
- `src/generators/cursor.ts` - Generates `.cursor/rules/*.md`
- `src/generators/cline.ts` - Generates `.clinerules/*.md`

### Input Format
Rule files in `.rulesync/` use the following frontmatter:
- `priority`: high|low
- `targets`: ["*"] or [copilot, cursor, cline] - "*" applies to all tools
- `description`: Brief description of the rule
- `globs`: File patterns where rule applies (e.g., ["**/*.ts", "**/*.js"])

## Development Commands

```bash
# Development with hot reload
pnpm dev

# Production build (CommonJS + ESM)
pnpm build

# Code quality checks
pnpm lint           # Biome linting
pnpm format         # Biome formatting
pnpm format:check   # Format checking
pnpm check          # Combined lint + format
pnpm secretlint     # Secret detection

# Testing
pnpm test           # Run tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report

# Running specific tests
pnpm test src/generators/copilot.test.ts
```

## Key Dependencies

- **Commander.js**: CLI framework
- **gray-matter**: Frontmatter parsing
- **marked**: Markdown processing
- **chokidar**: File watching for `watch` command
- **tsup**: Bundling (outputs both CJS and ESM)
- **tsx**: TypeScript execution for development

## Build System

- Requires Node.js 20.0.0+ (recommended: 24.0.0+)
- Uses `@tsconfig/node24` base configuration
- tsup outputs both CommonJS (`dist/index.js`) and ESM (`dist/index.mjs`)
- Binary entry point: `dist/index.js`
- Type definitions included in build output

## Code Quality Tools

- **Biome**: Unified linter/formatter (configured in `biome.json`)
- **secretlint**: Secret leak prevention (configured in `.secretlintrc.json`)
- **TypeScript**: Strict mode with additional safety checks
- VS Code: Auto-format on save configured in `.vscode/settings.json`

## CLI Usage Pattern

The tool follows a typical workflow:
1. `rulesync init` - Creates `.rulesync/` directory with sample files
2. Edit rule files in `.rulesync/` with appropriate frontmatter
3. `rulesync generate` - Generates tool-specific configuration files
4. `rulesync validate` - Validates rule structure
5. `rulesync status` - Shows current state
6. `rulesync watch` - Auto-regenerates on file changes