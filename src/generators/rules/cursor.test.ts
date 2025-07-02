import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Config, ParsedRule } from "../../types/index.js";
import { loadIgnorePatterns } from "../../utils/ignore.js";
import { generateCursorConfig } from "./cursor.js";

vi.mock("../../utils/ignore.js", () => ({
  loadIgnorePatterns: vi.fn(),
}));

describe("generateCursorConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConfig: Config = {
    aiRulesDir: ".rulesync",
    outputPaths: {
      copilot: ".github/instructions",
      cursor: ".cursor/rules",
      cline: ".clinerules",
      claudecode: "",
      claude: "",
      roo: ".roo/rules",
      geminicli: "",
    },
    watchEnabled: false,
    defaultTargets: ["cursor"],
  };

  describe("rule type generation based on 4 type of .mdc", () => {
    it("should generate 'always' type for globs: ['**/*']", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({ patterns: [] });

      const alwaysRule: ParsedRule = {
        frontmatter: {
          root: false,
          targets: ["*"],
          description: "API development rule",
          globs: ["**/*"],
        },
        content: "# Always Applied Rule\n\nThis rule applies to all files.",
        filename: "always-rule",
        filepath: ".rulesync/always-rule.md",
      };

      const outputs = await generateCursorConfig([alwaysRule], mockConfig);

      expect(outputs).toHaveLength(1);
      expect(outputs[0].content).toContain("description:");
      expect(outputs[0].content).toContain("globs:");
      expect(outputs[0].content).toContain("alwaysApply: true");
      expect(outputs[0].content).toContain("# Always Applied Rule");
    });

    it("should generate 'manual' type for empty description and empty globs", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({ patterns: [] });

      const manualRule: ParsedRule = {
        frontmatter: {
          root: false,
          targets: ["*"],
          description: "",
          globs: [],
        },
        content: "# Manual Rule\n\nThis rule requires manual application.",
        filename: "manual-rule",
        filepath: ".rulesync/manual-rule.md",
      };

      const outputs = await generateCursorConfig([manualRule], mockConfig);

      expect(outputs).toHaveLength(1);
      expect(outputs[0].content).toContain("description:");
      expect(outputs[0].content).toContain("globs:");
      expect(outputs[0].content).toContain("alwaysApply: false");
      expect(outputs[0].content).toContain("# Manual Rule");
    });

    it("should generate 'autoattached' type for empty description and non-empty globs", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({ patterns: [] });

      const autoAttachedRule: ParsedRule = {
        frontmatter: {
          root: false,
          targets: ["*"],
          description: "",
          globs: ["**/*.json", "**/*.ts", "**/*.js"],
        },
        content: "# Auto Attached Rule\n\nThis rule auto-attaches to specific files.",
        filename: "auto-attached-rule",
        filepath: ".rulesync/auto-attached-rule.md",
      };

      const outputs = await generateCursorConfig([autoAttachedRule], mockConfig);

      expect(outputs).toHaveLength(1);
      expect(outputs[0].content).toContain("description:");
      expect(outputs[0].content).toContain("globs: **/*.json,**/*.ts,**/*.js");
      expect(outputs[0].content).toContain("alwaysApply: false");
      expect(outputs[0].content).toContain("# Auto Attached Rule");
    });

    it("should generate 'agentrequested' type for non-empty description and empty globs", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({ patterns: [] });

      const agentRequestedRule: ParsedRule = {
        frontmatter: {
          root: false,
          targets: ["*"],
          description: "API development rule",
          globs: [],
        },
        content: "# Agent Requested Rule\n\nThis rule is applied when requested by agent.",
        filename: "agent-requested-rule",
        filepath: ".rulesync/agent-requested-rule.md",
      };

      const outputs = await generateCursorConfig([agentRequestedRule], mockConfig);

      expect(outputs).toHaveLength(1);
      expect(outputs[0].content).toContain("description: API development rule");
      expect(outputs[0].content).toContain("globs:");
      expect(outputs[0].content).toContain("alwaysApply: false");
      expect(outputs[0].content).toContain("# Agent Requested Rule");
    });

    it("should handle edge case: non-empty description and non-empty globs (should be agentrequested)", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({ patterns: [] });

      const edgeCaseRule: ParsedRule = {
        frontmatter: {
          root: false,
          targets: ["*"],
          description: "API development rule",
          globs: ["**/*.ts"],
        },
        content: "# Edge Case Rule\n\nThis has both description and globs.",
        filename: "edge-case-rule",
        filepath: ".rulesync/edge-case-rule.md",
      };

      const outputs = await generateCursorConfig([edgeCaseRule], mockConfig);

      expect(outputs).toHaveLength(1);
      // According to the specification order, this should be 'agentrequested'
      // because it doesn't match 'always' (globs != ["**/*"]) or 'manual' (description not empty)
      // or 'autoattached' (description not empty), so falls to 'agentrequested'
      expect(outputs[0].content).toContain("description: API development rule");
      expect(outputs[0].content).toContain("globs:");
      expect(outputs[0].content).toContain("alwaysApply: false");
    });
  });

  describe("ignore file generation", () => {
    const testRule: ParsedRule = {
      frontmatter: {
        root: false,
        targets: ["*"],
        description: "Test rule",
        globs: ["**/*.ts"],
      },
      content: "Test rule content",
      filename: "test-rule",
      filepath: ".rulesync/test-rule.md",
    };

    it("should generate .cursorignore when .rulesyncignore exists", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({
        patterns: ["*.test.md", "temp/**/*"],
      });

      const outputs = await generateCursorConfig([testRule], mockConfig);

      expect(outputs).toHaveLength(2);

      // Check rule file
      expect(outputs[0].filepath).toBe(".cursor/rules/test-rule.mdc");

      // Check .cursorignore file
      expect(outputs[1]).toEqual({
        tool: "cursor",
        filepath: ".cursorignore",
        content: expect.stringContaining("# Generated by rulesync from .rulesyncignore"),
      });
      expect(outputs[1].content).toContain("*.test.md");
      expect(outputs[1].content).toContain("temp/**/*");
    });

    it("should not generate .cursorignore when no ignore patterns exist", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({ patterns: [] });

      const outputs = await generateCursorConfig([testRule], mockConfig);

      expect(outputs).toHaveLength(1);
      expect(outputs.every((o) => o.filepath !== ".cursorignore")).toBe(true);
    });

    it("should respect baseDir parameter", async () => {
      vi.mocked(loadIgnorePatterns).mockResolvedValue({
        patterns: ["*.test.md"],
      });

      const outputs = await generateCursorConfig([testRule], mockConfig, "/custom/base");

      expect(outputs).toHaveLength(2);
      expect(outputs[0].filepath).toBe("/custom/base/.cursor/rules/test-rule.mdc");
      expect(outputs[1].filepath).toBe("/custom/base/.cursorignore");
    });
  });
});
