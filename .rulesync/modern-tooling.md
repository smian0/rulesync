---
root: false
targets: ["*"]
description: "Modern development tooling and workflow practices"
globs: ["*.config.ts", "*.config.js", "package.json", "tsconfig.json", "biome.json"]
---

# Modern Tooling Standards

## Build and Development

### TypeScript Configuration
- Use `@tsconfig/node24` as base configuration
- Enable strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- Generate declaration files and source maps for debugging
- Exclude test files from build output

### Build Tool (tsup)
- Generate both ESM and CommonJS outputs for maximum compatibility
- Include TypeScript declarations (`.d.ts`, `.d.mts`)
- Clean output directory before each build
- Use `--dts` flag for declaration generation

### Package Manager (pnpm)
- Use pnpm for faster installs and better dependency resolution
- Specify exact package manager version in `packageManager` field
- Use `pnpm-lock.yaml` for reproducible builds
- Leverage pnpm workspaces for monorepo setups

## Code Quality Tools

### Linting and Formatting (Biome)
- Replace ESLint + Prettier with Biome for better performance
- Use recommended rules as baseline
- Configure consistent formatting (2 spaces, double quotes, semicolons)
- Enable Git integration with VCS options

### Testing (Vitest)
- Use Vitest for TypeScript-first testing experience
- Enable globals for cleaner test syntax
- Configure V8 coverage provider for accurate reports
- Co-locate test files with source files

### Security Scanning
- Use `secretlint` to detect committed secrets
- Configure presets for common secret patterns
- Run in CI/CD pipeline for continuous security
- Include custom rules for project-specific patterns

## Development Workflow

### Scripts Organization
```json
{
  "dev": "tsx src/cli/index.ts",
  "build": "tsup src/cli/index.ts --format cjs,esm --dts --clean",
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "lint": "biome lint src/",
  "format": "biome format --write src/",
  "check": "biome check src/",
  "secretlint": "secretlint \"**/*\""
}
```

### Node.js Version Management
- Target Node.js 20+ for modern features
- Use engines field to enforce minimum version
- Leverage recent ECMAScript features in target version
- Consider LTS versions for better stability

### Performance Optimization
- Use native Node.js APIs when possible
- Minimize dependencies and bundle size
- Implement lazy loading for heavy operations
- Profile and optimize critical paths