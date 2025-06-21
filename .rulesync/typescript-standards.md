---
root: true
targets: ["*"]
description: "TypeScript strict mode development standards for rulesync project"
globs: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Development Standards

## Type Safety Requirements
- Always use explicit type definitions
- Prohibit `any`, use `unknown` instead
- Follow `noUncheckedIndexedAccess` setting - perform undefined checks for array/object access
- Follow `exactOptionalPropertyTypes` setting - strictly define optional property types
- Use type guards for runtime validation

## Naming Conventions
- Use camelCase for functions and variables
- Function names start with verbs (e.g., `parseRuleFile`, `generateOutput`)
- Constants use `UPPER_SNAKE_CASE`
- Type definitions use `PascalCase`

## Function Patterns
- Prioritize regular function declarations over arrow functions
- Use `async/await` for asynchronous processing (avoid Promise chains)
- Utilize early return patterns for error handling

## Import/Export Standards
- Prioritize named exports (avoid default exports)
- Use absolute imports over relative imports
- Import order: Node.js built-in → external libraries → internal modules

## Error Handling
- Provide custom error messages with file paths and specific values
- Always validate function input values
- Use type guards to ensure runtime safety