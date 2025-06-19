---
root: true
targets: ['*']
description: "rulesync project overview and architecture guide"
globs: ["src/**/*.ts"]
---

# rulesync Project Overview

rulesync is a unified AI configuration management CLI tool that supports multiple AI development tools (GitHub Copilot, Cursor, Cline, Claude Code).

## Core Architecture

### Main Components
- **CLI Entry Point**: `src/cli/index.ts` - Uses Commander.js
- **Core Parsing**: `src/core/parser.ts` - Frontmatter processing with gray-matter
- **Generation Engine**: `src/core/generator.ts` - Orchestrates tool-specific configuration file generation
- **Tool-Specific Generators**: `src/generators/` - Markdown generation for each AI tool

### Design Patterns
- **TypeScript strict mode**: Enable `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- **Dual ESM/CJS output**: Generate dist/index.js (CJS) and dist/index.mjs (ESM) with tsup
- **Functional approach**: Prioritize pure functions and minimize side effects
- **Error handling**: Emphasize specific error messages and type safety

### Input Data Structure
```typescript
type RuleFrontmatter = {
  root: boolean;           // Whether it's root level
  targets: ["*"] | ToolTarget[]; // Target tool specification
  description: string;     // Concise rule description
  globs: string[];        // File patterns to apply
}
```
