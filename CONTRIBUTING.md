# Contributing to rulesync

We welcome contributions to rulesync! This document outlines the process for contributing and how to get started.

**English** | [日本語](./CONTRIBUTING.ja.md)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/rulesync.git`
3. Install dependencies: `pnpm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js 20.0.0 or higher (recommended: 24.0.0+)
- pnpm (recommended) or npm/yarn

### Development Commands

```bash
# Install dependencies
pnpm install

# Run in development mode with hot reload
pnpm dev

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check

# Run both lint and format
pnpm check

# Check for secrets
pnpm secretlint
```

## Project Architecture

### Core Structure

```
rulesync/
├── src/
│   ├── cli/
│   │   ├── commands/        # CLI command implementations
│   │   │   ├── init.ts      # Initialize project
│   │   │   ├── add.ts       # Add new rule files
│   │   │   ├── generate.ts  # Generate configurations
│   │   │   ├── watch.ts     # File watching
│   │   │   ├── status.ts    # Project status
│   │   │   ├── validate.ts  # Rule validation
│   │   │   └── gitignore.ts # .gitignore management
│   │   └── index.ts        # CLI entry point (Commander.js)
│   ├── core/
│   │   ├── parser.ts       # Parse .rulesync/*.md files
│   │   ├── generator.ts    # Orchestrate generation
│   │   └── validator.ts    # Validate rule structure
│   ├── generators/         # Tool-specific generators
│   │   ├── copilot.ts     # GitHub Copilot Custom Instructions
│   │   ├── cursor.ts      # Cursor Project Rules (MDC format)
│   │   ├── cline.ts       # Cline Rules
│   │   ├── claude.ts      # Claude Code Memory (CLAUDE.md + memories)
│   │   └── roo.ts         # Roo Code Rules
│   ├── types/              # TypeScript type definitions
│   │   ├── config.ts      # Configuration types
│   │   └── rules.ts       # Rule and frontmatter types
│   └── utils/
│       ├── file.ts         # File operations (read/write/delete)
│       └── config.ts       # Configuration management
├── dist/                   # Build output (CJS + ESM)
└── tests/                  # Test files (*.test.ts)
```

### Key Dependencies

- **Commander.js**: CLI framework for command-line interface
- **gray-matter**: Frontmatter parsing for Markdown files
- **marked**: Markdown parsing and rendering
- **chokidar**: File watching for `watch` command
- **tsup**: Build system (outputs both CJS and ESM)
- **tsx**: TypeScript execution for development
- **Biome**: Unified linter and formatter
- **Vitest**: Testing framework with coverage

### Build System

- **Target**: Node.js 20.0.0+ (recommended: 24.0.0+)
- **TypeScript**: Strict mode with `@tsconfig/node24`
- **Output**: Both CommonJS (`dist/index.js`) and ESM (`dist/index.mjs`)
- **Binary**: `dist/index.js` (executable entry point)
- **Types**: Included in build output

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue template if available
3. Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node.js version, OS, etc.)

### Feature Requests

1. Search existing issues for similar requests
2. Describe the feature and its use case
3. Consider providing a design proposal or mockup

### Pull Requests

1. **Before starting work on a large feature, please open an issue to discuss it**
2. Make sure your changes are covered by tests
3. Follow the existing code style (enforced by Biome)
4. Write clear commit messages
5. Update documentation if needed

#### Pull Request Process

1. Fork and create a feature branch
2. Write your code and tests
3. Run the full test suite: `pnpm test`
4. Run code quality checks: `pnpm check`
5. Check for secrets: `pnpm secretlint`
6. Commit your changes with a clear message
7. Push to your fork and create a pull request

#### Commit Message Format

We use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
- `feat(generators): add support for new AI tool`
- `fix(parser): handle missing frontmatter gracefully`
- `docs(readme): update installation instructions`

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting:

- 2 spaces for indentation
- Semicolons required
- Double quotes for strings
- Trailing commas in multi-line objects/arrays

The style is automatically enforced by our CI pipeline and pre-commit hooks.

## Testing

The project uses Vitest for testing with comprehensive coverage (currently 95.46%):

### Test Structure

- **Unit tests**: Individual function testing
- **Integration tests**: Command and generator testing  
- **Mocking**: Uses Vitest's built-in mocking capabilities
- **Coverage target**: 80%+

### Writing Tests

- Write tests for new features and bug fixes
- Use descriptive test names
- Test both success and error cases  
- Keep tests focused and isolated
- Follow the pattern: `src/module.ts` → `src/module.test.ts`

### Running Tests

```bash
# All tests (100+ tests currently)
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test src/generators/copilot.test.ts
```

### Test Coverage by Module

- **cli/commands**: 98.48% (excellent coverage)
- **core**: High coverage across all modules
- **generators**: High coverage across all modules  
- **utils**: High coverage across all modules
- **types**: High coverage across all modules

## Adding New AI Tools

To add support for a new AI tool:

1. **Create generator**: Add `src/generators/newtool.ts`
2. **Implement interface**: Export async function following the pattern
3. **Add to core**: Update `src/core/generator.ts` 
4. **Add CLI option**: Update `src/cli/index.ts`
5. **Update types**: Add to `ToolTarget` in `src/types/rules.ts`
6. **Add tests**: Create `src/generators/newtool.test.ts`
7. **Update docs**: Add to README.md

### Generator Interface Pattern

```typescript
export async function generateNewToolConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string
): Promise<GeneratedOutput[]> {
  const outputs: GeneratedOutput[] = [];
  
  for (const rule of rules) {
    const content = generateNewToolMarkdown(rule);
    const outputDir = baseDir ? join(baseDir, config.outputPaths.newtool) : config.outputPaths.newtool;
    const filepath = join(outputDir, `${rule.filename}.ext`);
    
    outputs.push({
      tool: "newtool",
      filepath,
      content,
    });
  }
  
  return outputs;
}
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions/classes
- Update README.md for API changes
- Include examples in documentation

## Security

- Never commit secrets, API keys, or personal information
- Use `pnpm secretlint` to check for potential secrets
- Report security issues privately to the maintainers

## Questions?

Feel free to:
- Open an issue for questions about contributing
- Start a discussion for broader topics
- Reach out to maintainers for guidance

Thank you for contributing to rulesync!