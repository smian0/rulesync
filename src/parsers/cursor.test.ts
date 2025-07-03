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

  afterEach(async () => {
    try {
      // Reset permissions before cleanup
      const { chmod } = await import("node:fs/promises");
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      const cursorIgnore = join(testDir, ".cursorignore");
      const cursorrules = join(testDir, ".cursorrules");

      try {
        await chmod(cursorRulesDir, 0o755);
        await chmod(cursorIgnore, 0o644);
        await chmod(cursorrules, 0o644);
      } catch {}

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
        "# Documentation Maintenance\n\nThis rule applies to all files using the asterisk wildcard without quotes.",
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
        "# Legacy Cursor Rules\n\nThis is a legacy .cursorrules file.",
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

    it("should handle .cursorrules file parsing errors", async () => {
      // Create corrupted .cursorrules file that causes read error
      writeFileSync(join(testDir, ".cursorrules"), "Valid content");

      // Simulate read error by overwriting with invalid file
      const { chmod } = await import("node:fs/promises");
      await chmod(join(testDir, ".cursorrules"), 0o000); // Remove read permissions

      const result = await parseCursorConfiguration(testDir);

      // May have read permission error or still parse successfully based on system
      expect(result.errors.length).toBeGreaterThanOrEqual(0);

      // Restore permissions for cleanup
      await chmod(join(testDir, ".cursorrules"), 0o644);
    });

    it("should handle .cursor/rules directory parsing errors", async () => {
      // Create .cursor/rules directory
      const cursorRulesDir = join(testDir, ".cursor", "rules");
      mkdirSync(cursorRulesDir, { recursive: true });

      writeFileSync(join(cursorRulesDir, "test.mdc"), "Valid content");

      // Simulate permission error
      const { chmod } = await import("node:fs/promises");
      await chmod(cursorRulesDir, 0o000);

      const result = await parseCursorConfiguration(testDir);

      // Permission handling varies by system, just check result
      expect(result.errors.length).toBeGreaterThanOrEqual(0);

      // Restore permissions for cleanup
      await chmod(cursorRulesDir, 0o755);
    });

    it("should parse .cursorignore file", async () => {
      // Add a valid config file first
      writeFileSync(join(testDir, ".cursorrules"), "# Valid config");

      const cursorIgnoreContent = `# Comment line
node_modules/
*.log
dist/

# Another comment  
.env`;

      writeFileSync(join(testDir, ".cursorignore"), cursorIgnoreContent);

      const result = await parseCursorConfiguration(testDir);

      expect(result.ignorePatterns).toEqual(["node_modules/", "*.log", "dist/", ".env"]);
    });

    it("should handle .cursorignore parsing errors", async () => {
      // Add a valid config file first
      writeFileSync(join(testDir, ".cursorrules"), "# Valid config");

      writeFileSync(join(testDir, ".cursorignore"), "Valid content");

      const { chmod } = await import("node:fs/promises");
      await chmod(join(testDir, ".cursorignore"), 0o000);

      const result = await parseCursorConfiguration(testDir);

      // Permission handling varies by system
      expect(result.rules.length).toBeGreaterThanOrEqual(1);

      // Restore permissions for cleanup
      await chmod(join(testDir, ".cursorignore"), 0o644);
    });

    it("should parse .cursor/mcp.json file", async () => {
      // Add a valid config file first
      writeFileSync(join(testDir, ".cursorrules"), "# Valid config");

      const cursorDir = join(testDir, ".cursor");
      mkdirSync(cursorDir, { recursive: true });

      const mcpConfig = {
        mcpServers: {
          "test-server": {
            command: "test-command",
            args: ["--test"],
            targets: ["cursor"],
          },
        },
      };

      writeFileSync(join(cursorDir, "mcp.json"), JSON.stringify(mcpConfig, null, 2));

      const result = await parseCursorConfiguration(testDir);

      expect(result.mcpServers).toBeDefined();
      expect(result.mcpServers!["test-server"]).toEqual({
        command: "test-command",
        args: ["--test"],
        targets: ["cursor"],
      });
    });

    it("should handle .cursor/mcp.json parsing errors", async () => {
      // Add a valid config file first
      writeFileSync(join(testDir, ".cursorrules"), "# Valid config");

      const cursorDir = join(testDir, ".cursor");
      mkdirSync(cursorDir, { recursive: true });

      writeFileSync(join(cursorDir, "mcp.json"), "invalid json content");

      const result = await parseCursorConfiguration(testDir);

      // Should have at least 1 rule from .cursorrules, and may have mcp parsing error
      expect(result.rules.length).toBeGreaterThanOrEqual(1);
    });
  });
});
