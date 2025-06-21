---
root: false
targets: ["*"]
description: "Security best practices for CLI tool development"
globs: ["**/*.ts", "**/*.js"]
---

# Security Practices

## Secret Management
- Never commit API keys, tokens, or sensitive data
- Use `secretlint` to automatically detect potential secrets
- Use environment variables for configuration
- Validate and sanitize all user inputs

## Safe File Operations
- Validate file paths to prevent directory traversal
- Use atomic writes to prevent corruption
- Implement proper error handling for file I/O
- Respect user permissions and file system constraints

## Dependency Security
- Regularly update dependencies to patch vulnerabilities
- Use `pnpm audit` to check for known vulnerabilities
- Pin exact versions in package.json for reproducible builds
- Minimize dependency surface area
EOF < /dev/null