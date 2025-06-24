import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../types/index.js";
import { generateCopilotConfig } from "./copilot.js";

const mockConfig: Config = {
  aiRulesDir: ".rulesync",
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
    claudecode: ".",
  },
  defaultTargets: ["copilot", "cursor", "cline"],
  watchEnabled: false,
};

describe("copilot generator", () => {
  const mockRules: ParsedRule[] = [
    {
      frontmatter: {
        root: true,
        targets: ["copilot"],
        description: "Overview coding rule",
        globs: ["**/*.ts"],
      },
      content: "Use TypeScript for all new code.",
      filename: "typescript-rule",
      filepath: "/test/typescript-rule.md",
    },
    {
      frontmatter: {
        root: false,
        targets: ["copilot"],
        description: "Detail naming rule",
        globs: ["**/*.js"],
      },
      content: "Use camelCase for variables.",
      filename: "naming-rule",
      filepath: "/test/naming-rule.md",
    },
  ];

  it("should generate separate files for each rule", async () => {
    const outputs = await generateCopilotConfig(mockRules, mockConfig);

    expect(outputs).toHaveLength(2);
    expect(outputs[0].tool).toBe("copilot");
    expect(outputs[0].filepath).toBe(".github/instructions/typescript-rule.instructions.md");
    expect(outputs[1].filepath).toBe(".github/instructions/naming-rule.instructions.md");
  });

  it("should include frontmatter with description and applyTo", async () => {
    const outputs = await generateCopilotConfig(mockRules, mockConfig);

    expect(outputs[0].content).toContain('description: "Overview coding rule"');
    expect(outputs[0].content).toContain('applyTo: "**/*.ts"');
    expect(outputs[0].content).toContain("Use TypeScript for all new code.");

    expect(outputs[1].content).toContain('description: "Detail naming rule"');
    expect(outputs[1].content).toContain('applyTo: "**/*.js"');
    expect(outputs[1].content).toContain("Use camelCase for variables.");
  });

  it("should handle rules without globs", async () => {
    const rulesWithoutGlobs: ParsedRule[] = [
      {
        frontmatter: {
          root: true,
          targets: ["copilot"],
          description: "General rule",
          globs: [],
        },
        content: "General content",
        filename: "general",
        filepath: "/test/general.md",
      },
    ];

    const outputs = await generateCopilotConfig(rulesWithoutGlobs, mockConfig);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].content).toContain('applyTo: "**"');
  });

  it("should handle empty rules array", async () => {
    const outputs = await generateCopilotConfig([], mockConfig);

    expect(outputs).toHaveLength(0);
  });
});
