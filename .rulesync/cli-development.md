---
root: false
targets: ['*']
description: "CLI tool development guidelines and Commander.js usage conventions"
globs: ["src/cli/**/*.ts"]
---

# CLI Tool Development Guidelines

## Commander.js Usage Conventions

### Command Structure
- Each command is placed as an individual file in `src/cli/commands/`
- Command names use lowercase kebab-case (e.g., `generate`, `init`, `watch`)
- Prioritize flag options over subcommands

### Option Definitions
- Provide both short and long forms (e.g., `-o, --output`)
- Obtain default values from configuration files or environment variables
- Minimize required options

### Help Messages
- Add clear descriptions to each command
- Include usage examples
- Keep option descriptions concise and specific

## Error Handling

### Exit Codes
- Success: 0
- General error: 1
- Configuration error: 2
- File I/O error: 3

### Error Messages
- Use user-friendly language
- Include solution suggestions
- Show technical details only in debug mode

## Usability

### Progress Display
- Show progress bars or spinners for long-running processes
- Display file processing progress

### Configuration Files
- Customizable settings via `.rulesync/config.json`
- Designed for immediate use with default settings

### Output Format
- Standard output: success messages and results
- Standard error: error messages and debug information
- Use emoji and colors for better UX (✅ ❌ ⚠️ 📁 🎯)
- Verbose mode with `--verbose` flag for detailed output

## Modern CLI Best Practices

### Tool Integration
- Support for monorepo workflows with `--base-dir` option
- File watching capabilities with `chokidar`
- Atomic file operations to prevent corruption
- Git integration awareness

### Performance Considerations
- Lazy loading of heavy dependencies
- Efficient file operations with streaming
- Parallel processing where applicable
- Memory-efficient parsing for large files

### Developer Experience
- Rich help text with examples
- Auto-completion friendly command structure
- Comprehensive error messages with suggestions
- Status and validation commands for debugging