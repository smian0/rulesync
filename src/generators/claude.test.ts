import { describe, expect, it } from "vitest";
import { generateClaudeConfig } from "../../src/generators/claude.js";
import type { ParsedRule } from "../../src/types/index.js";
import { getDefaultConfig } from "../../src/utils/config.js";

describe("claude generator", () => {
  const config = getDefaultConfig();

  const mockRules: ParsedRule[] = [
    {
      frontmatter: {
        priority: "high",
        targets: ["claude"],
        description: "High priority coding rule",
        globs: ["**/*.ts"],
      },
      content: "Use TypeScript for all new code.",
      filename: "typescript-rule",
      filepath: "/test/typescript-rule.md",
    },
    {
      frontmatter: {
        priority: "medium",
        targets: ["claude"],
        description: "Medium priority architecture rule",
        globs: ["**/*.tsx"],
      },
      content: "Follow clean architecture principles.",
      filename: "architecture-rule",
      filepath: "/test/architecture-rule.md",
    },
    {
      frontmatter: {
        priority: "low",
        targets: ["claude"],
        description: "Low priority naming rule",
        globs: ["**/*.js"],
      },
      content: "Use camelCase for variables.",
      filename: "naming-rule",
      filepath: "/test/naming-rule.md",
    },
  ];

  it("should generate claude configuration", async () => {
    const output = await generateClaudeConfig(mockRules, config);

    expect(output.tool).toBe("claude");
    expect(output.filepath).toBe("./CLAUDE.md");
    expect(output.content).toContain("# Claude Code Memory - Project Instructions");
    expect(output.content).toContain("Generated from rulesync configuration");
    expect(output.content).toContain("## Critical Rules");
    expect(output.content).toContain("## Important Guidelines");
    expect(output.content).toContain("## Additional Considerations");
  });

  it("should sort rules by priority", async () => {
    const output = await generateClaudeConfig(mockRules, config);

    // High priority should come before medium, medium before low
    const highPriorityIndex = output.content.indexOf("typescript-rule");
    const mediumPriorityIndex = output.content.indexOf("architecture-rule");
    const lowPriorityIndex = output.content.indexOf("naming-rule");

    expect(highPriorityIndex).toBeLessThan(mediumPriorityIndex);
    expect(mediumPriorityIndex).toBeLessThan(lowPriorityIndex);
  });

  it("should include rule metadata", async () => {
    const output = await generateClaudeConfig([mockRules[0]], config);

    expect(output.content).toContain("**Description:** High priority coding rule");
    expect(output.content).toContain("**File patterns:** **/*.ts");
    expect(output.content).toContain("Use TypeScript for all new code.");
  });

  it("should handle rules without description", async () => {
    const ruleWithoutDescription: ParsedRule = {
      frontmatter: {
        priority: "high",
        targets: ["claude"],
        description: "",
        globs: [],
      },
      content: "Some rule content.",
      filename: "test-rule",
      filepath: "/test/test-rule.md",
    };

    const output = await generateClaudeConfig([ruleWithoutDescription], config);

    expect(output.content).not.toContain("**Description:**");
    expect(output.content).toContain("Some rule content.");
  });

  it("should handle rules without globs", async () => {
    const ruleWithoutGlobs: ParsedRule = {
      frontmatter: {
        priority: "high",
        targets: ["claude"],
        description: "Test rule",
        globs: [],
      },
      content: "Some rule content.",
      filename: "test-rule",
      filepath: "/test/test-rule.md",
    };

    const output = await generateClaudeConfig([ruleWithoutGlobs], config);

    expect(output.content).not.toContain("**File patterns:**");
    expect(output.content).toContain("**Description:** Test rule");
  });

  it("should handle empty rules array", async () => {
    const output = await generateClaudeConfig([], config);

    expect(output.content).toContain("# Claude Code Memory - Project Instructions");
    expect(output.content).not.toContain("## Critical Rules");
    expect(output.content).not.toContain("## Important Guidelines");
    expect(output.content).not.toContain("## Additional Considerations");
  });

  it("should group rules correctly by priority", async () => {
    const output = await generateClaudeConfig(mockRules, config);

    // Check that high priority rules appear under Critical Rules
    const criticalSection = output.content.substring(
      output.content.indexOf("## Critical Rules"),
      output.content.indexOf("## Important Guidelines")
    );
    expect(criticalSection).toContain("typescript-rule");

    // Check that medium priority rules appear under Important Guidelines
    const importantSection = output.content.substring(
      output.content.indexOf("## Important Guidelines"),
      output.content.indexOf("## Additional Considerations")
    );
    expect(importantSection).toContain("architecture-rule");

    // Check that low priority rules appear under Additional Considerations
    const additionalSection = output.content.substring(
      output.content.indexOf("## Additional Considerations")
    );
    expect(additionalSection).toContain("naming-rule");
  });
});