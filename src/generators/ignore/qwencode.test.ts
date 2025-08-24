import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../../types/index.js";
import { generateQwenCodeIgnoreFiles } from "./qwencode.js";

describe("generateQwenCodeIgnoreFiles", () => {
  const mockConfig: Config = {
    aiRulesDir: ".rulesync",
    outputPaths: {
      qwencode: ".qwen",
      agentsmd: ".",
      amazonqcli: ".",
      augmentcode: ".augment",
      "augmentcode-legacy": ".",
      copilot: ".github",
      cursor: ".cursor",
      cline: ".",
      claudecode: ".",
      codexcli: ".",
      opencode: ".",
      roo: ".roo",
      geminicli: ".gemini",
      kiro: ".kiro",
      junie: ".junie",
      windsurf: ".windsurf",
    },
    watchEnabled: false,
    defaultTargets: ["qwencode"],
  };

  it("should generate default settings with no rules", async () => {
    const result = await generateQwenCodeIgnoreFiles([], mockConfig);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tool: "qwencode",
      filepath: expect.stringContaining(".qwen/settings.json"),
    });

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent).toEqual({
      fileFiltering: {
        respectGitIgnore: true,
        enableRecursiveFileSearch: true,
      },
    });
  });

  it("should extract respectGitIgnore from JSON config blocks", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "config.md",
        filepath: "/test/config.md",
        content: `# Qwen Code Configuration

Configure file filtering:

\`\`\`json
{
  "fileFiltering": {
    "respectGitIgnore": false,
    "enableRecursiveFileSearch": true
  }
}
\`\`\``,
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Config rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(false);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(true);
  });

  it("should extract enableRecursiveFileSearch from JSON config blocks", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "performance.md",
        filepath: "/test/performance.md",
        content: `# Performance Settings

For better performance in large repositories:

\`\`\`javascript
{
  "fileFiltering": {
    "enableRecursiveFileSearch": false
  }
}
\`\`\``,
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Performance rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(false);
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(true); // default
  });

  it("should extract settings from text patterns", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "text-config.md",
        filepath: "/test/text-config.md",
        content: `# Text Configuration

Set respectGitIgnore: false for this project.
Also set enableRecursiveFileSearch: false for performance.`,
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Text config rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(false);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(false);
  });

  it("should handle quoted text patterns", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "quoted.md",
        filepath: "/test/quoted-config.md",
        content: `# Quoted Configuration

Set "respectGitIgnore": false and "enableRecursiveFileSearch": true.`,
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Quoted config rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(false);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(true);
  });

  it("should handle invalid JSON blocks gracefully", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "invalid.md",
        filepath: "/test/invalid.md",
        content: `# Invalid JSON

\`\`\`json
{
  "fileFiltering": {
    "respectGitIgnore": "invalid-value",
    // invalid comment in JSON
  }
}
\`\`\``,
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Invalid JSON rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    // Should use defaults since JSON parsing failed
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(true);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(true);
  });

  it("should combine multiple rules with different settings", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "rule1.md",
        filepath: "/test/rule1.md",
        content: `# Rule 1

\`\`\`json
{
  "fileFiltering": {
    "respectGitIgnore": false
  }
}
\`\`\``,
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Rule 1",
        },
      },
      {
        filename: "rule2.md",
        filepath: "/test/rule2.md",
        content: "Set enableRecursiveFileSearch: false for performance.",
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Rule 2",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(false);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(false);
  });

  it("should use custom baseDir when provided", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "test.md",
        filepath: "/test/test.md",
        content: "Test content",
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Test rule",
        },
      },
    ];

    const customBaseDir = "/custom/output";
    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig, customBaseDir);

    expect(result[0]?.filepath).toBe("/custom/output/.qwen/settings.json");
  });

  it("should handle empty content rules", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "empty.md",
        filepath: "/test/empty.md",
        content: "",
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "Empty rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(true);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(true);
  });

  it("should handle rules with no fileFiltering configuration", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "general.md",
        filepath: "/test/general.md",
        content: "# General guidelines\n\nUse TypeScript for all code.",
        frontmatter: {
          targets: ["qwencode"] as const,
          root: false,
          globs: ["**/*"],
          description: "General rule",
        },
      },
    ];

    const result = await generateQwenCodeIgnoreFiles(rules, mockConfig);

    const parsedContent = JSON.parse(result[0]?.content ?? "{}");
    expect(parsedContent.fileFiltering.respectGitIgnore).toBe(true);
    expect(parsedContent.fileFiltering.enableRecursiveFileSearch).toBe(true);
  });
});
