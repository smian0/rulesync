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

### Naming
- Test function names follow `should + expected behavior` format
- Use specific and understandable names