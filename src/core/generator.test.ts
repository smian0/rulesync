import { describe, expect, it } from "vitest";
import type { Config, ParsedRule, ToolTarget } from "../types/index.js";
import { generateConfigurations } from "./generator.js";

const mockConfig: Config = {
  aiRulesDir: ".rulesync",
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
    claude: ".",
  },
  defaultTargets: ["copilot", "cursor", "cline", "claude"],
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
  {
    filename: "claude-only.md",
    filepath: "/path/to/claude-only.md",
    frontmatter: {
      targets: ["claude"],
      priority: "medium",
      description: "Claude only rule",
      globs: ["**/*.tsx"],
    },
    content: "This is a claude only rule",
  },
];

describe("generateConfigurations", () => {
  it("should generate configurations for all default targets", async () => {
    const outputs = await generateConfigurations(mockRules, mockConfig);

    expect(outputs).toHaveLength(4);
    expect(outputs.map((o) => o.tool)).toEqual(["copilot", "cursor", "cline", "claude"]);
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
    expect(outputs[0].content).not.toContain("This is a claude only rule");
  });

  it("should generate claude configuration correctly", async () => {
    const outputs = await generateConfigurations(mockRules, mockConfig, ["claude"]);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].tool).toBe("claude");
    expect(outputs[0].filepath).toBe("./CLAUDE.md");
    expect(outputs[0].content).toContain("This is a test rule");
    expect(outputs[0].content).toContain("This is a claude only rule");
    expect(outputs[0].content).not.toContain("This is a copilot only rule");
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
