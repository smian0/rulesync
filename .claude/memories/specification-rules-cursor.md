# Cursor Project Rules (v1.2 Specification)

https://docs.cursor.com/context/rules-for-ai

## Overview
Cursor v1.2 uses individual `.mdc` rule files for project-specific AI context and instructions. This replaces the legacy `.cursorrules` file approach.

## File Locations
- **Per-project**: `PROJECT_ROOT/.cursor/rules/*.mdc`
- **Nested directories**: Any subdirectory can have its own `.cursor/rules/` folder for directory-specific rules
- **Global rules**: Defined in Cursor Settings → Rules (not stored as files)
- **Legacy support**: `.cursorrules` still read but deprecated

## File Naming Conventions
- Use kebab-case: `core-standards.mdc`, `testing-rules.mdc`
- Numeric prefixes for ordering: `001-core-standards.mdc`, `200-testing.mdc`
- Must use `.mdc` extension; other extensions ignored

## File Structure
Every `.mdc` file contains YAML frontmatter followed by Markdown content:

```markdown
---
description: "Short action-trigger-outcome sentence"
globs: "src/**/*.ts, tests/**/*_spec.rb"
alwaysApply: false
# Optional human metadata (ignored by engine):
tags: [react, performance]
priority: 2
version: 1.0.0
---

# Body (Markdown content)
- Bullet-point instructions for the AI
- You can @reference-files.tsx to pull them into context
<example>
Good / bad examples, code, diagrams, XML blocks, etc.
</example>
```

## Engine-Recognized Keys
- **description** (string): Required for "Agent Requested" rules
- **globs** (string | string[]): File glob patterns for auto-attachment (comma or newline-separated)
- **alwaysApply** (boolean, default: false): When true, creates "Always" rule (ignores globs)

Additional keys (tags, priority, version, author, etc.) are for human use only.

## Rule Types (Auto-determined)
1. **Always**: `alwaysApply: true` (glob patterns ignored)
2. **Auto Attached**: `globs` present, `alwaysApply: false`
3. **Agent Requested**: `description` present, but no globs/alwaysApply
4. **Manual**: None of the above - only used when explicitly @mentioned

## Body Section Capabilities
- Regular Markdown (headings, lists, code fences, Mermaid diagrams)
- Inline @references: `@service-template.ts` includes file contents in prompt
- Optional pseudo-XML sections: `<rule>`, `<example>`, `<non-negotiable>`, etc.
- Recommended length: ≤ 500 lines; split large guidance into smaller rules

## Directory & Glob Behavior
- Rules only attach if a matching file is opened/referenced
- `alwaysApply: true` ignores globs completely
- Sub-directories of `.cursor/rules` are not searched recursively
- Each folder needs its own `.cursor/rules` directory

## Example Patterns

### Always Rule (Communication Style)
```markdown
---
description: "Please answer concisely and avoid repetition"
alwaysApply: true
---
```

### Auto-Attached Framework Rule
```markdown
---
description: "Next.js App Router best practices"
globs: "app/**/*.{ts,tsx}"
---
- Use server components by default...
```

### Agent-Requested Helper
```markdown
---
description: "How to bump package versions with changesets"
---
1. Add a changeset...
```

## Version History
- **May 2024**: Initial .mdc support alongside .cursorrules (experimental)
- **Aug 2024 (v0.45)**: .mdc promoted; alwaysApply and globs surfaced in UI
- **Apr 15 2025 (v0.49)**: Nested .cursor/rules, /Generate Cursor Rules command, reliable "Always" rules persistence
- **Jun 2025 (v1.1.6)**: Bug-fixes for MDC editor freeze
- **Current (v1.2)**: Stable specification as documented above

## Best Practices
- Keep rules short and specific
- Use descriptive filenames with kebab-case
- Reference files with @ for context inclusion
- Split large concepts into multiple focused rules
- Use frontmatter keys properly to control rule application
- Avoid external resource references