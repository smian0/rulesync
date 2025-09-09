import { describe, expect, it } from "vitest";
import { RulesProcessor } from "./rules-processor.js";
import { RulesyncRule } from "./rulesync-rule.js";

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
});
