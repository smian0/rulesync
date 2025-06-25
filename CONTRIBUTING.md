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
- pnpm 10.12.2+ (recommended) or npm/yarn

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

# Fix linting and formatting issues
pnpm fix

# Check for secrets
pnpm secretlint

# Type checking
pnpm typecheck
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
│   │   │   ├── import.ts    # Import existing configurations
│   │   │   ├── watch.ts     # File watching
│   │   │   ├── status.ts    # Project status
│   │   │   ├── validate.ts  # Rule validation
│   │   │   └── gitignore.ts # .gitignore management
│   │   └── index.ts        # CLI entry point (Commander.js)
│   ├── core/
│   │   ├── parser.ts       # Parse .rulesync/*.md files
│   │   ├── generator.ts    # Orchestrate generation
│   │   ├── importer.ts     # Import existing configurations
│   │   └── validator.ts    # Validate rule structure
│   ├── generators/         # Tool-specific generators
│   │   ├── copilot.ts     # GitHub Copilot Custom Instructions
│   │   ├── cursor.ts      # Cursor Project Rules (MDC format)
│   │   ├── cline.ts       # Cline Rules
│   │   ├── claudecode.ts  # Claude Code Memory (CLAUDE.md + memories)
│   │   ├── geminicli.ts   # Gemini CLI configuration (GEMINI.md + memories)
│   │   └── roo.ts         # Roo Code Rules
│   ├── parsers/           # Tool-specific parsers for import functionality
│   │   ├── copilot.ts     # Parse GitHub Copilot configurations (.github/copilot-instructions.md)
│   │   ├── cursor.ts      # Parse Cursor configurations (.cursorrules, .cursor/rules/*.mdc)
│   │   ├── cline.ts       # Parse Cline configurations (.cline/instructions.md)
│   │   ├── claudecode.ts  # Parse Claude Code configurations (CLAUDE.md, .claude/memories/*.md)
│   │   ├── geminicli.ts   # Parse Gemini CLI configurations (GEMINI.md, .gemini/memories/*.md)
│   │   └── roo.ts         # Parse Roo Code configurations (.roo/instructions.md)
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

- **Commander.js v14.0.0**: CLI framework for command-line interface
- **gray-matter v4.0.3**: Frontmatter parsing for Markdown files (supports YAML, TOML, JSON)
- **marked v15.0.12**: Markdown parsing and rendering
- **chokidar v4.0.3**: File watching for `watch` command with high performance
- **tsup v8.5.0**: Build system (outputs both CJS and ESM)
- **tsx v4.20.3**: TypeScript execution for development
- **Biome v2.0.0**: Unified linter and formatter (replaces ESLint + Prettier)
- **Vitest v3.2.4**: Testing framework with coverage

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

The project uses Vitest for testing with comprehensive coverage (current: 157 tests across 21 test files, target: 80%+ coverage):

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
# All tests (157 tests across 21 test files)
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test src/generators/copilot.test.ts

# Run tests for specific functionality
pnpm test src/cli/commands/import.test.ts  # Test import functionality
pnpm test src/parsers/                     # Test all parsers
```

### Test Coverage by Module

- **cli/commands**: 85.41% (good coverage, new import command needs testing)
- **core**: 62.97% (needs improvement, new importer module requires tests)
- **generators**: High coverage across all modules  
- **utils**: High coverage across all modules
- **types**: High coverage across all modules

Note: Coverage temporarily reduced due to new import functionality requiring test implementation.

## Adding New AI Tools

To add support for a new AI tool (see the recent addition of `geminicli` as a reference):

1. **Create generator**: Add `src/generators/newtool.ts`
2. **Create parser**: Add `src/parsers/newtool.ts` for import functionality
3. **Implement interfaces**: Export async functions following the patterns
4. **Add to core**: Update `src/core/generator.ts` and `src/core/importer.ts`
5. **Add CLI options**: Update `src/cli/index.ts` for both generate and import commands
6. **Update types**: Add to `ToolTarget` in `src/types/rules.ts`
7. **Update config**: Add output path in `src/utils/config.ts`
8. **Add tests**: Create `src/generators/newtool.test.ts` and `src/parsers/newtool.test.ts`
9. **Update docs**: Add to README.md and README.ja.md

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

### Parser Interface Pattern

```typescript
export async function parseNewToolConfiguration(
  baseDir: string = process.cwd()
): Promise<{ rules: ParsedRule[]; errors: string[] }> {
  const rules: ParsedRule[] = [];
  const errors: string[] = [];
  
  // Check for configuration files
  const configFiles = await findNewToolConfigFiles(baseDir);
  
  if (configFiles.length === 0) {
    errors.push("No NewTool configuration files found");
    return { rules, errors };
  }
  
  // Parse each configuration file
  for (const configFile of configFiles) {
    try {
      const content = await readFile(configFile, "utf-8");
      const parsed = await parseNewToolFormat(content);
      rules.push({
        ...parsed,
        filename: generateUniqueFilename("newtool", parsed),
      });
    } catch (error) {
      errors.push(`Failed to parse ${configFile}: ${error.message}`);
    }
  }
  
  return { rules, errors };
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