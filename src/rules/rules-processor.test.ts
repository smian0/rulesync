import { describe, expect, it } from "vitest";
import { AugmentcodeLegacyRule } from "./augmentcode-legacy-rule.js";
import { ClaudecodeRule } from "./claudecode-rule.js";
import { CopilotRule } from "./copilot-rule.js";
import { CursorRule } from "./cursor-rule.js";
import { RulesProcessor } from "./rules-processor.js";
import { RulesyncRule } from "./rulesync-rule.js";
import { WarpRule } from "./warp-rule.js";

describe("RulesProcessor", () => {
  describe("isTargetedByRulesyncRule", () => {
    it("should return true for rules targeting rulesync", () => {
      const rulesyncRule = new RulesyncRule({
        baseDir: "/test",
        relativeDirPath: ".rulesync/rules",
        relativeFilePath: "test.md",
        frontmatter: {
          targets: ["rulesync"],
        },
        body: "Test content",
      });

      expect(RulesProcessor.isTargetedByRulesyncRule(rulesyncRule)).toBe(true);
    });

    it("should return true for rules targeting all tools (*)", () => {
      const rulesyncRule = new RulesyncRule({
        baseDir: "/test",
        relativeDirPath: ".rulesync/rules",
        relativeFilePath: "test.md",
        frontmatter: {
          targets: ["*"],
        },
        body: "Test content",
      });

      expect(RulesProcessor.isTargetedByRulesyncRule(rulesyncRule)).toBe(true);
    });

    it("should return false for rules not targeting processor", () => {
      const rulesyncRule = new RulesyncRule({
        baseDir: "/test",
        relativeDirPath: ".rulesync/rules",
        relativeFilePath: "test.md",
        frontmatter: {
          targets: ["cursor", "copilot"],
        },
        body: "Test content",
      });

      expect(RulesProcessor.isTargetedByRulesyncRule(rulesyncRule)).toBe(false);
    });

    it("should return false for empty targets", () => {
      const rulesyncRule = new RulesyncRule({
        baseDir: "/test",
        relativeDirPath: ".rulesync/rules",
        relativeFilePath: "test.md",
        frontmatter: {
          targets: [],
        },
        body: "Test content",
      });

      expect(RulesProcessor.isTargetedByRulesyncRule(rulesyncRule)).toBe(false);
    });

    it("should handle mixed targets including rulesync", () => {
      const rulesyncRule = new RulesyncRule({
        baseDir: "/test",
        relativeDirPath: ".rulesync/rules",
        relativeFilePath: "test.md",
        frontmatter: {
          targets: ["cursor", "rulesync", "copilot"],
        },
        body: "Test content",
      });

      expect(RulesProcessor.isTargetedByRulesyncRule(rulesyncRule)).toBe(true);
    });

    it("should handle undefined targets in frontmatter", () => {
      const rulesyncRule = new RulesyncRule({
        baseDir: "/test",
        relativeDirPath: ".rulesync/rules",
        relativeFilePath: "test.md",
        frontmatter: {},
        body: "Test content",
      });

      expect(RulesProcessor.isTargetedByRulesyncRule(rulesyncRule)).toBe(true);
    });
  });

  describe("convertRulesyncFilesToToolFiles", () => {
    it("should filter out rules not targeted for the specific tool", async () => {
      const processor = new RulesProcessor({
        baseDir: "/test",
        toolTarget: "copilot",
      });

      const rulesyncRules = [
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "copilot-rule.md",
          frontmatter: {
            targets: ["copilot"],
          },
          body: "Copilot specific rule",
        }),
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "cursor-rule.md",
          frontmatter: {
            targets: ["cursor"],
          },
          body: "Cursor specific rule",
        }),
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "all-tools-rule.md",
          frontmatter: {
            targets: ["*"],
          },
          body: "Rule for all tools",
        }),
      ];

      const result = await processor.convertRulesyncFilesToToolFiles(rulesyncRules);

      // Should include copilot-specific rule and all-tools rule, but not cursor-specific rule
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CopilotRule);
      expect(result[1]).toBeInstanceOf(CopilotRule);
    });

    it("should return empty array when no rules match the tool target", async () => {
      const processor = new RulesProcessor({
        baseDir: "/test",
        toolTarget: "warp",
      });

      const rulesyncRules = [
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "copilot-rule.md",
          frontmatter: {
            targets: ["copilot"],
          },
          body: "Copilot specific rule",
        }),
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "cursor-rule.md",
          frontmatter: {
            targets: ["cursor"],
          },
          body: "Cursor specific rule",
        }),
      ];

      const result = await processor.convertRulesyncFilesToToolFiles(rulesyncRules);

      expect(result).toHaveLength(0);
    });

    it("should handle mixed targets correctly", async () => {
      const processor = new RulesProcessor({
        baseDir: "/test",
        toolTarget: "claudecode",
      });

      const rulesyncRules = [
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "mixed-rule.md",
          frontmatter: {
            targets: ["cursor", "claudecode", "copilot"],
          },
          body: "Mixed targets rule",
        }),
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "other-rule.md",
          frontmatter: {
            targets: ["warp", "augmentcode"],
          },
          body: "Other tools rule",
        }),
      ];

      const result = await processor.convertRulesyncFilesToToolFiles(rulesyncRules);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ClaudecodeRule);
    });

    it("should handle undefined targets in frontmatter", async () => {
      const processor = new RulesProcessor({
        baseDir: "/test",
        toolTarget: "augmentcode-legacy",
      });

      const rulesyncRules = [
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "no-targets.md",
          frontmatter: {},
          body: "Rule without targets",
        }),
      ];

      const result = await processor.convertRulesyncFilesToToolFiles(rulesyncRules);

      // Should include the rule since undefined targets means it applies to all
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AugmentcodeLegacyRule);
    });

    it("should handle empty targets array", async () => {
      const processor = new RulesProcessor({
        baseDir: "/test",
        toolTarget: "warp",
      });

      const rulesyncRules = [
        new RulesyncRule({
          baseDir: "/test",
          relativeDirPath: ".rulesync/rules",
          relativeFilePath: "empty-targets.md",
          frontmatter: {
            targets: [],
          },
          body: "Rule with empty targets",
        }),
      ];

      const result = await processor.convertRulesyncFilesToToolFiles(rulesyncRules);

      // Should not include the rule since empty targets means it doesn't apply to any tool
      expect(result).toHaveLength(0);
    });

    it("should throw error for unsupported tool target", () => {
      expect(() => {
        new RulesProcessor({
          baseDir: "/test",
          toolTarget: "unsupported-tool" as any,
        });
      }).toThrow();
    });

    it("should correctly validate and filter rules for each supported tool", async () => {
      const testCases = [
        { toolTarget: "copilot" as const, ruleClass: CopilotRule },
        { toolTarget: "cursor" as const, ruleClass: CursorRule },
        { toolTarget: "claudecode" as const, ruleClass: ClaudecodeRule },
        { toolTarget: "warp" as const, ruleClass: WarpRule },
        { toolTarget: "augmentcode-legacy" as const, ruleClass: AugmentcodeLegacyRule },
      ];

      for (const { toolTarget, ruleClass } of testCases) {
        const processor = new RulesProcessor({
          baseDir: "/test",
          toolTarget: toolTarget,
        });

        const rulesyncRules = [
          new RulesyncRule({
            baseDir: "/test",
            relativeDirPath: ".rulesync/rules",
            relativeFilePath: "targeted-rule.md",
            frontmatter: {
              targets: [toolTarget],
            },
            body: `${toolTarget} specific rule`,
          }),
          new RulesyncRule({
            baseDir: "/test",
            relativeDirPath: ".rulesync/rules",
            relativeFilePath: "non-targeted-rule.md",
            frontmatter: {
              targets: ["windsurf"],
            },
            body: "Other tool rule",
          }),
        ];

        const result = await processor.convertRulesyncFilesToToolFiles(rulesyncRules);

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(ruleClass);
      }
    });
  });
});
