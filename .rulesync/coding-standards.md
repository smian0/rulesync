---
root: false
targets: ['*']
description: "TypeScript/Node.js coding standards and best practices"
globs: ["src/**/*.ts", "src/**/*.js", "**/*.test.ts"]
---

# Coding Standards and Best Practices

## TypeScript Standards

### Strict Type Safety
- Always use explicit type definitions
- Prohibit `any`, use `unknown` instead
- Follow `noUncheckedIndexedAccess` setting, perform undefined checks for array/object access
- Follow `exactOptionalPropertyTypes` setting, strictly define optional property types

### Function and Variable Naming
- Use camelCase format
- Function names start with verbs (e.g., `parseRuleFile`, `generateOutput`)
- Constants use `UPPER_SNAKE_CASE`
- Type definitions use `PascalCase`

### Import/Export
- Prioritize named exports (avoid default exports)
- Use absolute imports over relative imports
- Import order: Node.js built-in → external libraries → internal modules

## Code Style (Biome Configuration Compliant)

### Formatting
- Indentation: 2 spaces
- Line width: 100 characters
- Semicolons: required
- Quotes: double quotes
- Trailing commas: ES5 format

### Function Definitions
- Prioritize regular function declarations over arrow functions
- Use `async/await` for asynchronous processing (avoid Promise chains)

## Error Handling

### Exception Handling
- Provide custom error messages
- Include file paths and specific values
- Utilize early return patterns

### Validation
- Always validate function input values
- Use type guards to ensure runtime safety

## Test Code

### Structure
- Create test files in `*.test.ts` format
- Create test cases corresponding to each function
- Cover both normal and error cases
- Maintain high test coverage (current: 96.86%)

### Naming
- Test function names follow `should + expected behavior` format
- Use specific and understandable names
- Group related tests in describe blocks

### Testing Strategy
- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test CLI commands and workflows
- **Error handling**: Test edge cases and error scenarios
- **Mocking**: Use Vitest mocking for external dependencies
- **Coverage**: Aim for 95%+ code coverage with meaningful tests

### Test Organization
```
src/
├── module.ts
└── module.test.ts    # Co-located with source files
```

## Security Practices

### Secret Management
- Never commit API keys, tokens, or sensitive data
- Use `secretlint` to automatically detect potential secrets
- Run `pnpm secretlint` as part of CI/CD pipeline
- Use environment variables for configuration

### Input Validation
- Validate all user inputs at CLI boundaries
- Sanitize file paths to prevent directory traversal
- Use type guards for runtime validation
- Implement safe file operations with atomic writes

### Dependencies
- Regularly update dependencies to patch security vulnerabilities
- Use `pnpm audit` to check for known vulnerabilities
- Pin exact versions in package.json for reproducible builds