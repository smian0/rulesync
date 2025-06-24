import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../types/index.js";
import { generateCursorConfig } from "./cursor.js";

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

const mockRules: ParsedRule[] = [
  {
    filename: "overview-rule",
    filepath: "/path/to/overview-rule.md",
    frontmatter: {
      targets: ["*"],
      root: true,
      description: "Overview rule",
      globs: ["**/*.ts", "**/*.js"],
    },
    content: "This is an overview rule content",
  },
  {
    filename: "detail-rule",
    filepath: "/path/to/detail-rule.md",
    frontmatter: {
      targets: ["cursor"],
      root: false,
      description: "Detail rule",
      globs: ["**/*.md"],
    },
    content: "This is a detail rule content",
  },
];

describe("generateCursorConfig", () => {
  it("should generate separate files for each rule", async () => {
    const results = await generateCursorConfig(mockRules, mockConfig);

    expect(results).toHaveLength(2);
    expect(results[0].tool).toBe("cursor");
    expect(results[0].filepath).toBe(".cursor/rules/overview-rule.mdc");
    expect(results[0].content).toContain("Overview rule");
    expect(results[1].filepath).toBe(".cursor/rules/detail-rule.mdc");
    expect(results[1].content).toContain("Detail rule");
  });

  it("should include frontmatter with description and globs", async () => {
    const results = await generateCursorConfig(mockRules, mockConfig);

    expect(results[0].content).toContain("description: Overview rule");
    expect(results[0].content).toContain("globs: **/*.ts,**/*.js");
    expect(results[0].content).toContain("ruletype: always");

    expect(results[1].content).toContain("description: Detail rule");
    expect(results[1].content).toContain("globs: **/*.md");
    expect(results[1].content).toContain("ruletype: autoattached");
  });

  it("should include rule content", async () => {
    const results = await generateCursorConfig(mockRules, mockConfig);

    expect(results[0].content).toContain("This is an overview rule content");
    expect(results[1].content).toContain("This is a detail rule content");
  });

  it("should handle rules without globs", async () => {
    const rulesWithoutGlobs: ParsedRule[] = [
      {
        filename: "no-globs.md",
        filepath: "/path/to/no-globs.md",
        frontmatter: {
          targets: ["cursor"],
          root: true,
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
    expect(results[0].content).toContain("ruletype: always");
  });

  it("should handle empty rules array", async () => {
    const results = await generateCursorConfig([], mockConfig);

    expect(results).toHaveLength(0);
  });
});
