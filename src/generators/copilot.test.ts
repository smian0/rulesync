import { describe, expect, it } from "vitest";
import { generateCopilotConfig } from "../../src/generators/copilot.js";
import type { ParsedRule } from "../../src/types/index.js";
import { getDefaultConfig } from "../../src/utils/config.js";

describe("copilot generator", () => {
  const config = getDefaultConfig();

  const mockRules: ParsedRule[] = [
    {
      frontmatter: {
        priority: "high",
        targets: ["copilot"],
        description: "High priority coding rule",
        globs: ["**/*.ts"],
      },
      content: "Use TypeScript for all new code.",
      filename: "typescript-rule",
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
      filename: "naming-rule",
      filepath: "/test/naming-rule.md",
    },
  ];

  it("should generate copilot configuration", async () => {
    const output = await generateCopilotConfig(mockRules, config);

    expect(output.tool).toBe("copilot");
    expect(output.filepath).toBe(".github/instructions/rulesync.instructions.md");
    expect(output.content).toContain("---");
    expect(output.content).toContain('description: "AI rules configuration for GitHub Copilot"');
    expect(output.content).toContain('applyTo: "**"');
    expect(output.content).toContain("# GitHub Copilot Instructions");
    expect(output.content).toContain("## High Priority Rules");
    expect(output.content).toContain("## Standard Rules");
  });

  it("should sort rules by priority", async () => {
    const output = await generateCopilotConfig(mockRules, config);

    // High priority should come before low priority
    const highPriorityIndex = output.content.indexOf("typescript-rule");
    const lowPriorityIndex = output.content.indexOf("naming-rule");

    expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);
  });

  it("should include rule metadata", async () => {
    const output = await generateCopilotConfig([mockRules[0]], config);

    expect(output.content).toContain("**Description:** High priority coding rule");
    expect(output.content).toContain("**Applies to:** **/*.ts");
    expect(output.content).toContain("Use TypeScript for all new code.");
  });

  it("should handle empty rules array", async () => {
    const output = await generateCopilotConfig([], config);

    expect(output.content).toContain("# GitHub Copilot Instructions");
    expect(output.content).not.toContain("## High Priority Rules");
    expect(output.content).not.toContain("## Standard Rules");
  });
});
