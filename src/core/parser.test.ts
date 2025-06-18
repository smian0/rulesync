import { describe, it, expect } from "vitest";
import { parseRuleFile } from "../../src/core/parser.js";
import { join } from "node:path";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";

const testDir = join(process.cwd(), "test-tmp");

describe("parser", () => {
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

  describe("parseRuleFile", () => {
    it("should parse valid rule file", async () => {
      const ruleContent = `---
priority: high
targets: ["copilot", "cursor"]
description: "Test rule"
globs: ["**/*.ts"]
---

# Test Rule

This is a test rule content.
`;

      const filepath = join(testDir, "test-rule.md");
      writeFileSync(filepath, ruleContent);

      const rule = await parseRuleFile(filepath);

      expect(rule.frontmatter.priority).toBe("high");
      expect(rule.frontmatter.targets).toEqual(["copilot", "cursor"]);
      expect(rule.frontmatter.description).toBe("Test rule");
      expect(rule.frontmatter.globs).toEqual(["**/*.ts"]);
      expect(rule.content.trim()).toBe("# Test Rule\n\nThis is a test rule content.");
      expect(rule.filename).toBe("test-rule");
      expect(rule.filepath).toBe(filepath);
    });

    it("should handle wildcard targets", async () => {
      const ruleContent = `---
priority: low
targets: ["*"]
description: "Test rule with wildcard"
globs: ["**/*.js"]
---

# Wildcard Rule
`;

      const filepath = join(testDir, "wildcard-rule.md");
      writeFileSync(filepath, ruleContent);

      const rule = await parseRuleFile(filepath);

      expect(rule.frontmatter.targets).toEqual(["*"]);
    });

    it("should throw error for invalid priority", async () => {
      const ruleContent = `---
priority: medium
targets: ["copilot"]
description: "Test rule"
globs: ["**/*.ts"]
---

# Invalid Rule
`;

      const filepath = join(testDir, "invalid-rule.md");
      writeFileSync(filepath, ruleContent);

      await expect(parseRuleFile(filepath)).rejects.toThrow("Invalid priority");
    });

    it("should throw error for invalid targets", async () => {
      const ruleContent = `---
priority: high
targets: ["invalid-tool"]
description: "Test rule"
globs: ["**/*.ts"]
---

# Invalid Rule
`;

      const filepath = join(testDir, "invalid-targets.md");
      writeFileSync(filepath, ruleContent);

      await expect(parseRuleFile(filepath)).rejects.toThrow("Invalid target");
    });

    it("should throw error for missing description", async () => {
      const ruleContent = `---
priority: high
targets: ["copilot"]
globs: ["**/*.ts"]
---

# Missing Description
`;

      const filepath = join(testDir, "missing-desc.md");
      writeFileSync(filepath, ruleContent);

      await expect(parseRuleFile(filepath)).rejects.toThrow("Invalid description");
    });
  });
});