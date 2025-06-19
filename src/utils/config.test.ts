import { describe, expect, it } from "vitest";
import { getDefaultConfig, resolveTargets } from "../../src/utils/config.js";

describe("config utils", () => {
  describe("getDefaultConfig", () => {
    it("should return default configuration", () => {
      const config = getDefaultConfig();

      expect(config.aiRulesDir).toBe(".rulesync");
      expect(config.outputPaths.copilot).toBe(".github/instructions");
      expect(config.outputPaths.cursor).toBe(".cursor/rules");
      expect(config.outputPaths.cline).toBe(".clinerules");
      expect(config.outputPaths.claude).toBe(".");
      expect(config.defaultTargets).toEqual(["copilot", "cursor", "cline", "claude", "roo"]);
      expect(config.watchEnabled).toBe(false);
    });
  });

  describe("resolveTargets", () => {
    const config = getDefaultConfig();

    it("should resolve * to all default targets", () => {
      const targets = resolveTargets(["*"], config);
      expect(targets).toEqual(["copilot", "cursor", "cline", "claude", "roo"]);
    });

    it("should return specific targets as-is", () => {
      const targets = resolveTargets(["copilot", "cursor"], config);
      expect(targets).toEqual(["copilot", "cursor"]);
    });

    it("should handle single target", () => {
      const targets = resolveTargets(["copilot"], config);
      expect(targets).toEqual(["copilot"]);
    });

    it("should handle claude target", () => {
      const targets = resolveTargets(["claude"], config);
      expect(targets).toEqual(["claude"]);
    });

    it("should handle mixed targets including claude", () => {
      const targets = resolveTargets(["copilot", "claude"], config);
      expect(targets).toEqual(["copilot", "claude"]);
    });
  });
});
