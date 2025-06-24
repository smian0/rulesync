import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseCursorConfiguration } from "./cursor.js";

const testDir = join(process.cwd(), "test-tmp-cursor");

describe("cursor parser", () => {
  beforeEach(() => {
    try {
      rmSync(testDir, { recursive: true });
    } catch {}
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true });
    } catch {}
  });

  describe("parseCursorConfiguration", () => {
    it("should parse .cursor/rules/*.mdc files", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      const mdcContent = `---
description: Test cursor rule
globs: "**/*.ts"
ruletype: always
---

# Test Cursor Rule

This is a test cursor rule content.
`;

      writeFileSync(join(cursorRulesDir, "test-rule.mdc"), mdcContent);

      const result = await parseCursorConfiguration(testDir);

      expect(result.errors).toEqual([]);
      expect(result.rules).toHaveLength(1);

      const rule = result.rules[0];
      expect(rule.frontmatter.targets).toEqual(["cursor"]);
      expect(rule.frontmatter.description).toBe("Cursor rule: test-rule");
      expect(rule.frontmatter.globs).toEqual(["**/*"]);
      expect(rule.content.trim()).toBe("# Test Cursor Rule\n\nThis is a test cursor rule content.");
      expect(rule.filename).toBe("cursor-test-rule");
    });

    it("should handle globs: * without quotes (Cursor's valid format)", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      // This is the specific case that was causing issues - globs: * without quotes
      const mdcContent = `---
description: Guidelines for maintaining project documentation
globs: *
ruletype: autoattached
---

# Documentation Maintenance

This rule applies to all files using the asterisk wildcard without quotes.
`;

      writeFileSync(join(cursorRulesDir, "docs-maintenance.mdc"), mdcContent);

      const result = await parseCursorConfiguration(testDir);

      expect(result.errors).toEqual([]);
      expect(result.rules).toHaveLength(1);

      const rule = result.rules[0];
      expect(rule.frontmatter.targets).toEqual(["cursor"]);
      expect(rule.frontmatter.description).toBe("Cursor rule: docs-maintenance");
      expect(rule.content.trim()).toBe(
        "# Documentation Maintenance\n\nThis rule applies to all files using the asterisk wildcard without quotes."
      );
      expect(rule.filename).toBe("cursor-docs-maintenance");
    });

    it("should handle multiple .mdc files including ones with globs: *", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      const mdcContent1 = `---
description: Build tooling standards
globs: "tsconfig.json,package.json,*.config.*"
ruletype: autoattached
---

# Build Standards
`;

      const mdcContent2 = `---
description: Documentation maintenance
globs: *
ruletype: autoattached
---

# Docs Maintenance
`;

      const mdcContent3 = `---
description: CLI development
globs: "src/cli/**/*.ts"
ruletype: autoattached
---

# CLI Development
`;

      writeFileSync(join(cursorRulesDir, "build-tooling.mdc"), mdcContent1);
      writeFileSync(join(cursorRulesDir, "docs-maintenance.mdc"), mdcContent2);
      writeFileSync(join(cursorRulesDir, "cli-development.mdc"), mdcContent3);

      const result = await parseCursorConfiguration(testDir);

      expect(result.errors).toEqual([]);
      expect(result.rules).toHaveLength(3);

      // Check that all files were parsed, including the one with globs: *
      const filenames = result.rules.map((rule) => rule.filename).sort();
      expect(filenames).toEqual([
        "cursor-build-tooling",
        "cursor-cli-development",
        "cursor-docs-maintenance",
      ]);
    });

    it("should parse legacy .cursorrules file", async () => {
      const cursorrrulesContent = `---
description: Legacy cursor rules
---

# Legacy Cursor Rules

This is a legacy .cursorrules file.
`;

      writeFileSync(join(testDir, ".cursorrules"), cursorrrulesContent);

      const result = await parseCursorConfiguration(testDir);

      expect(result.errors).toEqual([]);
      expect(result.rules).toHaveLength(1);

      const rule = result.rules[0];
      expect(rule.frontmatter.targets).toEqual(["cursor"]);
      expect(rule.frontmatter.description).toBe("Cursor IDE configuration rules");
      expect(rule.frontmatter.globs).toEqual(["**/*"]);
      expect(rule.content.trim()).toBe(
        "# Legacy Cursor Rules\n\nThis is a legacy .cursorrules file."
      );
      expect(rule.filename).toBe("cursor-rules");
    });

    it("should ignore non-.mdc files in .cursor/rules directory", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      const mdcContent = `---
description: Valid mdc file
globs: "**/*.ts"
ruletype: always
---

# Valid MDC File
`;

      writeFileSync(join(cursorRulesDir, "valid.mdc"), mdcContent);
      writeFileSync(join(cursorRulesDir, "invalid.txt"), "This should be ignored");
      writeFileSync(join(cursorRulesDir, "config.json"), '{"ignored": true}');

      const result = await parseCursorConfiguration(testDir);

      expect(result.errors).toEqual([]);
      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].filename).toBe("cursor-valid");
    });

    it("should handle empty content files", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      const emptyContent = `---
description: Empty content file
globs: "**/*.ts"
ruletype: always
---

`;

      writeFileSync(join(cursorRulesDir, "empty.mdc"), emptyContent);

      const result = await parseCursorConfiguration(testDir);

      // When files exist but have empty content, an error is generated because no rules were parsed
      expect(result.errors).toEqual([
        "No Cursor configuration files found (.cursorrules or .cursor/rules/*.mdc)",
      ]);
      expect(result.rules).toHaveLength(0); // Empty content files are skipped
    });

    it("should return error when no cursor configuration files are found", async () => {
      const result = await parseCursorConfiguration(testDir);

      expect(result.rules).toEqual([]);
      expect(result.errors).toEqual([
        "No Cursor configuration files found (.cursorrules or .cursor/rules/*.mdc)",
      ]);
    });

    it("should handle malformed YAML gracefully", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      // Malformed YAML that can't be rescued
      const malformedContent = `---
description: Malformed YAML
globs: [unclosed array
ruletype: always
---

# Malformed YAML
`;

      writeFileSync(join(cursorRulesDir, "malformed.mdc"), malformedContent);

      const result = await parseCursorConfiguration(testDir);

      expect(result.rules).toEqual([]);
      expect(result.errors).toHaveLength(2); // Parse error + no config files found
      expect(result.errors[0]).toContain("Failed to parse");
      expect(result.errors[1]).toContain("No Cursor configuration files found");
    });
  });
});
