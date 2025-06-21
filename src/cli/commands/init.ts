import { join } from "node:path";
import { ensureDir, fileExists, writeFileContent } from "../../utils/index.js";

export async function initCommand(): Promise<void> {
  const aiRulesDir = ".rulesync";

  console.log("Initializing rulesync...");

  // Create .rulesync directory
  await ensureDir(aiRulesDir);

  // Create sample rule files
  await createSampleFiles(aiRulesDir);

  console.log("✅ rulesync initialized successfully!");
  console.log("\nNext steps:");
  console.log("1. Edit rule files in .rulesync/");
  console.log("2. Run 'rulesync generate' to create configuration files");
}

async function createSampleFiles(aiRulesDir: string): Promise<void> {
  const sampleFiles = [
    {
      filename: "overview.md",
      content: `---
root: true
targets: ["*"]
description: "Project overview and general development guidelines"
globs: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx"]
---

# Project Overview

## General Guidelines

- Use TypeScript for all new code
- Follow consistent naming conventions
- Write self-documenting code with clear variable and function names
- Prefer composition over inheritance
- Use meaningful comments for complex business logic

## Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use double quotes for strings
- Use trailing commas in multi-line objects and arrays

## Architecture Principles

- Organize code by feature, not by file type
- Keep related files close together
- Use dependency injection for better testability
- Implement proper error handling
- Follow single responsibility principle
`,
    },
    {
      filename: "frontend.md",
      content: `---
root: false
targets: ["*"]
description: "Frontend development rules and best practices"
globs: ["src/components/**/*.tsx", "src/pages/**/*.tsx", "**/*.css", "**/*.scss"]
---

# Frontend Development Rules

## React Components

- Use functional components with hooks
- Follow PascalCase naming for components
- Use TypeScript interfaces for props
- Implement proper error boundaries

## Styling

- Use CSS modules or styled-components
- Follow BEM methodology for CSS classes
- Prefer flexbox and grid for layouts
- Use semantic HTML elements

## State Management

- Use React hooks for local state
- Consider Redux or Zustand for global state
- Avoid prop drilling with context API
- Keep state as close to where it's used as possible

## Performance

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use proper key props in lists
`,
    },
    {
      filename: "backend.md",
      content: `---
root: false
targets: ["*"]
description: "Backend development rules and API guidelines"
globs: ["src/api/**/*.ts", "src/services/**/*.ts", "src/models/**/*.ts"]
---

# Backend Development Rules

## API Design

- Follow RESTful conventions
- Use consistent HTTP status codes
- Implement proper error handling with meaningful messages
- Use API versioning when necessary

## Database

- Use proper indexing for performance
- Implement database migrations
- Follow naming conventions for tables and columns
- Use transactions for data consistency

## Security

- Validate all input data
- Use proper authentication and authorization
- Implement rate limiting
- Sanitize database queries to prevent SQL injection

## Code Organization

- Use service layer pattern
- Implement proper logging
- Use environment variables for configuration
- Write comprehensive tests for business logic
`,
    },
  ];

  for (const file of sampleFiles) {
    const filepath = join(aiRulesDir, file.filename);
    if (!(await fileExists(filepath))) {
      await writeFileContent(filepath, file.content);
      console.log(`Created ${filepath}`);
    } else {
      console.log(`Skipped ${filepath} (already exists)`);
    }
  }
}
