import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../types/index.js";
import { generateGeminiConfig } from "./geminicli.js";

const mockConfig: Config = {
  aiRulesDir: ".rulesync",
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
    claudecode: ".",
    roo: ".roo/rules",
    geminicli: ".gemini/memories",
  },
  defaultTargets: ["copilot", "cursor", "cline", "claudecode", "roo", "geminicli"],
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
      targets: ["geminicli"],
      root: false,
      description: "Detail rule",
      globs: ["**/*.md"],
    },
    content: "This is a detail rule content",
  },
];

describe("generateGeminiConfig", () => {
  it("should generate GEMINI.md root file and memory files", async () => {
    const results = await generateGeminiConfig(mockRules, mockConfig);

    expect(results).toHaveLength(2);

    // Check memory file
    expect(results[0].tool).toBe("geminicli");
    expect(results[0].filepath).toBe(".gemini/memories/detail-rule.md");
    expect(results[0].content).not.toContain("# Detail rule");
    expect(results[0].content).toContain("This is a detail rule content");

    // Check root file
    expect(results[1].tool).toBe("geminicli");
    expect(results[1].filepath).toBe("GEMINI.md");
    expect(results[1].content).toContain(
      "Please also reference the following documents as needed:"
    );
    expect(results[1].content).toContain("| Document | Description | File Patterns |");
    expect(results[1].content).toContain("@.gemini/memories/detail-rule.md");
    expect(results[1].content).toContain("This is an overview rule content");
  });

  it("should generate table of memory files in root file", async () => {
    const results = await generateGeminiConfig(mockRules, mockConfig);
    const rootFile = results.find((r) => r.filepath === "GEMINI.md");

    expect(rootFile?.content).toContain("| Document | Description | File Patterns |");
    expect(rootFile?.content).toContain(
      "| @.gemini/memories/detail-rule.md | Detail rule | **/*.md |"
    );
  });

  it("should handle only root rule", async () => {
    const rootOnlyRules: ParsedRule[] = [
      {
        filename: "root-only",
        filepath: "/path/to/root-only.md",
        frontmatter: {
          targets: ["geminicli"],
          root: true,
          description: "Root only rule",
          globs: ["**/*.ts"],
        },
        content: "This is root only content",
      },
    ];

    const results = await generateGeminiConfig(rootOnlyRules, mockConfig);

    expect(results).toHaveLength(1);
    expect(results[0].filepath).toBe("GEMINI.md");
    expect(results[0].content).toContain("This is root only content");
    expect(results[0].content).not.toContain(
      "Please also reference the following documents as needed:"
    );
  });

  it("should handle only memory rules", async () => {
    const memoryOnlyRules: ParsedRule[] = [
      {
        filename: "memory-rule",
        filepath: "/path/to/memory-rule.md",
        frontmatter: {
          targets: ["geminicli"],
          root: false,
          description: "Memory rule",
          globs: ["**/*.ts"],
        },
        content: "This is memory rule content",
      },
    ];

    const results = await generateGeminiConfig(memoryOnlyRules, mockConfig);

    expect(results).toHaveLength(2);

    // Memory file
    expect(results[0].filepath).toBe(".gemini/memories/memory-rule.md");
    expect(results[0].content).not.toContain("# Memory rule");

    // Root file
    expect(results[1].filepath).toBe("GEMINI.md");
    expect(results[1].content).toContain(
      "Please also reference the following documents as needed:"
    );
    expect(results[1].content).toContain("| Document | Description | File Patterns |");
    expect(results[1].content).not.toContain("This is memory rule content");
  });

  it("should handle empty rules array", async () => {
    const results = await generateGeminiConfig([], mockConfig);

    expect(results).toHaveLength(1);
    expect(results[0].filepath).toBe("GEMINI.md");
    expect(results[0].content).toContain("No configuration rules have been defined yet");
  });

  it("should use baseDir when provided", async () => {
    const results = await generateGeminiConfig(mockRules, mockConfig, "/custom/base");

    expect(results).toHaveLength(2);
    expect(results[0].filepath).toBe("/custom/base/.gemini/memories/detail-rule.md");
    expect(results[1].filepath).toBe("/custom/base/GEMINI.md");
  });
});
