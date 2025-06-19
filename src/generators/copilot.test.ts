import { describe, expect, it } from "vitest";
import { generateCopilotConfig } from "./copilot.js";
import type { Config, ParsedRule } from "../types/index.js";

const mockConfig: Config = {
  aiRulesDir: ".rulesync",
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
    claude: "."
  },
  defaultTargets: ["copilot", "cursor", "cline"],
  watchEnabled: false,
};

describe("copilot generator", () => {
  const mockRules: ParsedRule[] = [
    {
      frontmatter: {
        priority: "high",
        targets: ["copilot"],
        description: "High priority coding rule",
        globs: ["**/*.ts"],
      },
      content: "Use TypeScript for all new code.",
      filename: "typescript-rule.md",
      filepath: "/test/typescript-rule.md",
    },
    {
      frontmatter: {
        priority: "low",
        targets: ["copilot"],
        description: "Low priority naming rule",
        globs: ["**/*.js"],
      },
      content: "Use camelCase for variables.",
      filename: "naming-rule.md",
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

    expect(outputs[0].content).toContain('description: "High priority coding rule"');
    expect(outputs[0].content).toContain('applyTo: "**/*.ts"');
    expect(outputs[0].content).toContain("Use TypeScript for all new code.");
    
    expect(outputs[1].content).toContain('description: "Low priority naming rule"');
    expect(outputs[1].content).toContain('applyTo: "**/*.js"');
    expect(outputs[1].content).toContain("Use camelCase for variables.");
  });

  it("should handle rules without globs", async () => {
    const rulesWithoutGlobs: ParsedRule[] = [
      {
        frontmatter: {
          priority: "medium",
          targets: ["copilot"],
          description: "General rule",
          globs: [],
        },
        content: "General content",
        filename: "general.md",
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