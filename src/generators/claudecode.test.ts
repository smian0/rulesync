import { describe, expect, it } from "vitest";
import { generateClaudecodeConfig } from "../../src/generators/claudecode.js";
import type { ParsedRule } from "../../src/types/index.js";
import { getDefaultConfig } from "../../src/utils/config.js";

describe("claudecode generator", () => {
  const config = getDefaultConfig();

  const mockRules: ParsedRule[] = [
    {
      frontmatter: {
        root: true,
        targets: ["claudecode"],
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
        targets: ["claudecode"],
        description: "Detail architecture rule",
        globs: ["**/*.tsx"],
      },
      content: "Follow clean architecture principles.",
      filename: "architecture-rule",
      filepath: "/test/architecture-rule.md",
    },
    {
      frontmatter: {
        root: false,
        targets: ["claudecode"],
        description: "Detail naming rule",
        globs: ["**/*.js"],
      },
      content: "Use camelCase for variables.",
      filename: "naming-rule",
      filepath: "/test/naming-rule.md",
    },
  ];

  it("should generate claudecode configuration", async () => {
    const outputs = await generateClaudecodeConfig(mockRules, config);

    expect(outputs).toHaveLength(3); // 1 main file + 2 detail memory files
    expect(outputs[0].tool).toBe("claudecode");
    expect(outputs[0].filepath).toBe("CLAUDE.md");
    expect(outputs[0].content).not.toContain("# Claude Code Memory - Project Instructions");
    expect(outputs[0].content).not.toContain("Generated from rulesync configuration");
    expect(outputs[0].content).toContain("| Document | Description | File Patterns |");
    expect(outputs[0].content).toContain(
      "| @.claude/memories/architecture-rule.md | Detail architecture rule | **/*.tsx |"
    );
    expect(outputs[0].content).toContain(
      "| @.claude/memories/naming-rule.md | Detail naming rule | **/*.js |"
    );
  });

  it("should separate overview and detail rules", async () => {
    const outputs = await generateClaudecodeConfig(mockRules, config);

    // Main CLAUDE.md should contain overview rules and memory references
    expect(outputs[0].content).toContain("Use TypeScript for all new code.");
    expect(outputs[0].content).toContain("| Document | Description | File Patterns |");
    expect(outputs[0].content).toContain(
      "| @.claude/memories/architecture-rule.md | Detail architecture rule | **/*.tsx |"
    );
    expect(outputs[0].content).toContain(
      "| @.claude/memories/naming-rule.md | Detail naming rule | **/*.js |"
    );

    // Detail rules should be in separate memory files
    expect(outputs[1].filepath).toBe(".claude/memories/architecture-rule.md");
    expect(outputs[2].filepath).toBe(".claude/memories/naming-rule.md");
  });

  it("should include rule metadata", async () => {
    const outputs = await generateClaudecodeConfig([mockRules[0]], config);

    expect(outputs[0].content).not.toContain("### Overview coding rule");
    expect(outputs[0].content).toContain("Use TypeScript for all new code.");
  });

  it("should handle rules without description", async () => {
    const ruleWithoutDescription: ParsedRule = {
      frontmatter: {
        root: true,
        targets: ["claudecode"],
        description: "",
        globs: [],
      },
      content: "Some rule content.",
      filename: "test-rule",
      filepath: "/test/test-rule.md",
    };

    const outputs = await generateClaudecodeConfig([ruleWithoutDescription], config);

    expect(outputs[0].content).not.toContain("### Test rule");
    expect(outputs[0].content).toContain("Some rule content.");
  });

  it("should handle rules without globs", async () => {
    const ruleWithoutGlobs: ParsedRule = {
      frontmatter: {
        root: true,
        targets: ["claudecode"],
        description: "Test rule",
        globs: [],
      },
      content: "Some rule content.",
      filename: "test-rule",
      filepath: "/test/test-rule.md",
    };

    const outputs = await generateClaudecodeConfig([ruleWithoutGlobs], config);

    expect(outputs[0].content).toContain("Some rule content.");
  });

  it("should handle empty rules array", async () => {
    const outputs = await generateClaudecodeConfig([], config);

    expect(outputs).toHaveLength(1);
    expect(outputs[0].content).not.toContain("# Claude Code Memory - Project Instructions");
    expect(outputs[0].content).not.toContain("@");
  });

  it("should generate memory files for detail rules", async () => {
    const outputs = await generateClaudecodeConfig(mockRules, config);

    // Should have memory files for detail rules
    const architectureMemory = outputs.find((o) => o.filepath.includes("architecture-rule.md"));
    const namingMemory = outputs.find((o) => o.filepath.includes("naming-rule.md"));

    expect(architectureMemory).toBeDefined();
    expect(architectureMemory?.content).toContain("Follow clean architecture principles.");

    expect(namingMemory).toBeDefined();
    expect(namingMemory?.content).toContain("Use camelCase for variables.");
  });
});
