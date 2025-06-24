import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../types/index.js";
import { generateClineConfig } from "./cline.js";

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
    filename: "security",
    filepath: "/path/to/security.md",
    frontmatter: {
      targets: ["*"],
      root: true,
      description: "Security best practices",
      globs: ["**/*.ts", "**/*.js"],
    },
    content: "Always validate user input and sanitize data",
  },
  {
    filename: "styling",
    filepath: "/path/to/styling.md",
    frontmatter: {
      targets: ["cline"],
      root: false,
      description: "Code styling guidelines",
      globs: ["**/*.css"],
    },
    content: "Use consistent indentation and naming conventions",
  },
];

describe("generateClineConfig", () => {
  it("should generate separate files for each rule", async () => {
    const results = await generateClineConfig(mockRules, mockConfig);

    expect(results).toHaveLength(2);
    expect(results[0].tool).toBe("cline");
    expect(results[0].filepath).toBe(".clinerules/security.md");
    expect(results[1].filepath).toBe(".clinerules/styling.md");
  });

  it("should include rule descriptions as headers", async () => {
    const results = await generateClineConfig(mockRules, mockConfig);

    expect(results[0].content).toContain("Always validate user input and sanitize data");
    expect(results[1].content).toContain("Use consistent indentation and naming conventions");
  });

  it("should include file patterns when present", async () => {
    const results = await generateClineConfig(mockRules, mockConfig);

    expect(results[0].content).toContain("Always validate user input and sanitize data");
    expect(results[1].content).toContain("Use consistent indentation and naming conventions");
  });

  it("should include rule content", async () => {
    const results = await generateClineConfig(mockRules, mockConfig);

    expect(results[0].content).toContain("Always validate user input and sanitize data");
    expect(results[1].content).toContain("Use consistent indentation and naming conventions");
  });

  it("should handle rules without globs", async () => {
    const rulesWithoutGlobs: ParsedRule[] = [
      {
        filename: "general.md",
        filepath: "/path/to/general.md",
        frontmatter: {
          targets: ["*"],
          root: true,
          description: "General guidelines",
          globs: [],
        },
        content: "General content",
      },
    ];

    const results = await generateClineConfig(rulesWithoutGlobs, mockConfig);

    expect(results).toHaveLength(1);
    expect(results[0].content).not.toContain("**Applies to files:**");
    expect(results[0].content).toContain("General content");
  });

  it("should handle empty rules array", async () => {
    const results = await generateClineConfig([], mockConfig);

    expect(results).toHaveLength(0);
  });
});
