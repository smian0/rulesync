import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../types/index.js";
import { generateCursorConfig } from "./cursor.js";

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

const mockRules: ParsedRule[] = [
  {
    filename: "high-priority.md",
    filepath: "/path/to/high-priority.md",
    frontmatter: {
      targets: ["*"],
      priority: "high",
      description: "High priority rule",
      globs: ["**/*.ts", "**/*.js"],
    },
    content: "This is a high priority rule content",
  },
  {
    filename: "low-priority.md",
    filepath: "/path/to/low-priority.md",
    frontmatter: {
      targets: ["cursor"],
      priority: "low",
      description: "Low priority rule",
      globs: ["**/*.md"],
    },
    content: "This is a low priority rule content",
  },
];

describe("generateCursorConfig", () => {
  it("should generate separate files for each rule", async () => {
    const results = await generateCursorConfig(mockRules, mockConfig);

    expect(results).toHaveLength(2);
    expect(results[0].tool).toBe("cursor");
    expect(results[0].filepath).toBe(".cursor/rules/high-priority.md");
    expect(results[0].content).toContain("High priority rule");
    expect(results[1].filepath).toBe(".cursor/rules/low-priority.md");
    expect(results[1].content).toContain("Low priority rule");
  });

  it("should include frontmatter with description and globs", async () => {
    const results = await generateCursorConfig(mockRules, mockConfig);
    
    expect(results[0].content).toContain("description: High priority rule");
    expect(results[0].content).toContain('globs: ["**/*.ts", "**/*.js"]');
    expect(results[0].content).toContain("alwaysApply: true");
    
    expect(results[1].content).toContain("description: Low priority rule");
    expect(results[1].content).toContain('globs: ["**/*.md"]');
    expect(results[1].content).toContain("alwaysApply: false");
  });

  it("should include rule content", async () => {
    const results = await generateCursorConfig(mockRules, mockConfig);
    
    expect(results[0].content).toContain("This is a high priority rule content");
    expect(results[1].content).toContain("This is a low priority rule content");
  });

  it("should handle rules without globs", async () => {
    const rulesWithoutGlobs: ParsedRule[] = [
      {
        filename: "no-globs.md",
        filepath: "/path/to/no-globs.md",
        frontmatter: {
          targets: ["cursor"],
          priority: "medium",
          description: "Rule without globs",
          globs: [],
        },
        content: "Content without globs",
      },
    ];

    const results = await generateCursorConfig(rulesWithoutGlobs, mockConfig);
    
    expect(results).toHaveLength(1);
    expect(results[0].content).toContain("description: Rule without globs");
    expect(results[0].content).not.toContain("globs:");
    expect(results[0].content).toContain("alwaysApply: false");
  });

  it("should handle empty rules array", async () => {
    const results = await generateCursorConfig([], mockConfig);
    
    expect(results).toHaveLength(0);
  });
});