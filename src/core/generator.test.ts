import { describe, expect, it } from "vitest";
import { generateConfigurations } from "./generator.js";
import type { Config, ParsedRule, ToolTarget } from "../types/index.js";

const mockConfig: Config = {
  aiRulesDir: ".rulesync",
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
  },
  defaultTargets: ["copilot", "cursor", "cline"],
  watchEnabled: false,
};

const mockRules: ParsedRule[] = [
  {
    filename: "test-rule.md",
    filepath: "/path/to/test-rule.md",
    frontmatter: {
      targets: ["*"],
      priority: "high",
      description: "Test rule",
      globs: ["**/*.ts"],
    },
    content: "This is a test rule",
  },
  {
    filename: "copilot-only.md",
    filepath: "/path/to/copilot-only.md",
    frontmatter: {
      targets: ["copilot"],
      priority: "low",
      description: "Copilot only rule",
      globs: ["**/*.js"],
    },
    content: "This is a copilot only rule",
  },
];

describe("generateConfigurations", () => {
  it("should generate configurations for all default targets", async () => {
    const outputs = await generateConfigurations(mockRules, mockConfig);

    expect(outputs).toHaveLength(3);
    expect(outputs.map((o) => o.tool)).toEqual(["copilot", "cursor", "cline"]);
  });

  it("should generate configurations for specified targets only", async () => {
    const outputs = await generateConfigurations(mockRules, mockConfig, ["copilot"]);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].tool).toBe("copilot");
  });

  it("should filter rules correctly for each tool", async () => {
    const outputs = await generateConfigurations(mockRules, mockConfig, ["copilot"]);

    expect(outputs[0].content).toContain("This is a test rule");
    expect(outputs[0].content).toContain("This is a copilot only rule");
  });

  it("should handle empty rules gracefully", async () => {
    const outputs = await generateConfigurations([], mockConfig);

    expect(outputs).toHaveLength(0);
  });

  it("should handle unknown tools gracefully", async () => {
    const outputs = await generateConfigurations(mockRules, mockConfig, ["unknown" as ToolTarget]);

    expect(outputs).toHaveLength(0);
  });
});
