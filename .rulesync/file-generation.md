---
root: false
targets: ['*']
description: "File generation and Markdown processing best practices"
globs: ["src/generators/**/*.ts", "src/core/parser.ts", "src/utils/file.ts"]
---

# File Generation and Markdown Processing

## gray-matter Processing

### Frontmatter Parsing
- Support YAML frontmatter only
- Implement validation of required fields
- Guarantee type-safe parsing results

### Validation Rules
- `root`: boolean type, required
- `targets`: array type, "*" or valid tool names only
- `description`: non-empty string, required
- `globs`: string array, empty arrays allowed

## Generation Conventions for Each Tool

### GitHub Copilot
- Output to `.github/instructions/` directory
- Filename: `{rule-name}.instructions.md`
- Specify glob patterns in frontmatter's `applyTo` field

### Cursor
- Output to `.cursor/rules/` directory
- Filename: `{rule-name}.md`
- Can use additional file references (`@filename`) in content

### Cline
- Output to `.clinerules/` directory
- Filename: `{rule-name}.md`
- Plain Markdown format

### Claude Code
- Integrated format into `CLAUDE.md`
- Format importable with `@{rule-name}`

## File I/O Conventions

### Directory Creation
- Automatically create output directory if it doesn't exist
- Properly handle permission errors

### Character Encoding
- Use UTF-8 encoding
- Unify line endings to LF (\n)

### Atomic Operations
- Write to temporary file, then rename for atomic updates
- Prevent partial updates on write failures

### Backup
- Do not create backups when overwriting existing files
- Assume Git version control