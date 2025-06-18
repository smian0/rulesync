# Contributing to rulesync

We welcome contributions to rulesync! This document outlines the process for contributing and how to get started.

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

## Project Structure

```
src/
├── cli/                 # CLI interface and commands
│   ├── commands/       # Individual command implementations
│   └── index.ts        # CLI entry point
├── core/               # Core functionality
│   ├── parser.ts       # Rule file parsing
│   ├── generator.ts    # Configuration generation orchestration
│   └── validator.ts    # Rule validation
├── generators/         # Tool-specific generators
│   ├── copilot.ts     # GitHub Copilot generator
│   ├── cursor.ts      # Cursor IDE generator
│   └── cline.ts       # Cline generator
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

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

- Write tests for new features and bug fixes
- Use descriptive test names
- Test both success and error cases
- Keep tests focused and isolated

Run tests:
```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions/classes
- Update SPECIFICATION.md for API changes
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