# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ai-rules is a Node.js CLI tool that generates configuration files for various AI development tools (GitHub Copilot, Cursor, Cline) from unified rule files in `.ai-rules/*.md`. The tool solves the problem of maintaining consistent AI rules across different development environments.

## Core Architecture

### CLI Entry Point
- `src/cli/index.ts` - Main CLI entry using Commander.js
- `src/cli/commands/` - Individual command implementations (init, generate, watch, status, validate)

### Core Processing
- `src/core/parser.ts` - Parses `.ai-rules/*.md` files with gray-matter frontmatter
- `src/core/generator.ts` - Orchestrates generation of target configuration files
- `src/core/validator.ts` - Validates rule file structure and content

### Tool-Specific Generators
- `src/generators/copilot.ts` - Generates `.github/instructions/*.md`
- `src/generators/cursor.ts` - Generates `.cursor/rules/*.md`
- `src/generators/cline.ts` - Generates `.clinerules/*.md`

### Input Format
Rule files in `.ai-rules/` use frontmatter to specify:
- `priority`: high|low
- `targets`: ["*"] or [copilot, cursor, cline] - "*" applies to all tools
- `description`: Brief explanation of the rule
- `globs`: File patterns the rule applies to (e.g., ["**/*.ts", "**/*.js"])

## Development Commands

```bash
# Development with hot reload
pnpm dev

# Build for production (CommonJS + ESM)
pnpm build

# Code quality checks
pnpm lint           # Biome linting
pnpm format         # Biome formatting
pnpm check          # Biome lint + format
pnpm secretlint     # Secret detection

# Testing
pnpm test           # Run tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
```

## Key Dependencies

- **Commander.js**: CLI framework
- **gray-matter**: Frontmatter parsing
- **marked**: Markdown processing
- **chokidar**: File watching for `watch` command
- **tsup**: Bundling (outputs both CJS and ESM)
- **tsx**: Development TypeScript execution

## Build System

- Uses `@tsconfig/node24` base configuration
- Outputs both CommonJS (`dist/index.js`) and ESM (`dist/index.mjs`) via tsup
- Binary entry point: `dist/index.js`
- Type definitions included in build output

## Code Quality Tools

- **Biome**: Unified linter/formatter (configured in `biome.json`)
- **secretlint**: Prevents secret leakage (configured in `.secretlintrc.json`)
- **TypeScript**: Strict mode with additional safety checks
- VS Code: Auto-format on save configured in `.vscode/settings.json`