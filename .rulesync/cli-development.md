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
- Suppress output with `--quiet` flag