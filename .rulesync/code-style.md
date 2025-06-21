---
root: false
targets: ["*"]
description: "Biome-based code formatting and style standards"
globs: ["**/*.ts", "**/*.js", "**/*.json"]
---

# Code Style Standards (Biome Configuration)

## Formatting Requirements
- Indentation: 2 spaces (no tabs)
- Line width: 100 characters maximum
- Line endings: LF (\n)
- Semicolons: required
- Quotes: double quotes for strings
- Trailing commas: ES5 format only

## Code Organization
- Co-locate test files with source files (*.test.ts format)
- Use descriptive file names following kebab-case for CLI commands
- Organize imports: built-in → external → internal

## Comments and Documentation
- NEVER add comments unless explicitly requested
- Use TypeScript types for self-documenting code
- Keep functions focused and self-explanatory

## Git Integration
- Use VCS-enabled Biome configuration
- Respect .gitignore patterns
- Format all staged files before commit