---
root: false
targets: ["*"]
description: "Vitest-based testing standards and practices"
globs: ["**/*.test.ts", "**/*.spec.ts"]
---

# Testing Standards

## Test Organization
- Co-locate test files with source files (*.test.ts format)
- Use descriptive test names following "should + expected behavior" format
- Group related tests in describe blocks
- Maintain high test coverage (target: 95%+)

## Testing Strategy
- **Unit tests**: Test individual functions in isolation
- **Integration tests**: Test CLI commands and workflows
- **Error handling**: Test edge cases and error scenarios
- **Mocking**: Use Vitest mocking for external dependencies

## Test Structure
```typescript
describe("functionName", () => {
  it("should return expected result for valid input", () => {
    // Test implementation
  });

  it("should throw error for invalid input", () => {
    // Error case testing
  });
});
```

## Vitest Configuration
- Use globals for cleaner test syntax
- Configure V8 coverage provider for accurate reports
- Test both normal and error cases comprehensively
EOF < /dev/null