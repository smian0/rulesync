import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../../types/index.js";
import { generateAugmentcodeLegacyConfig } from "./augmentcode-legacy.js";

describe("generateAugmentcodeLegacyConfig", () => {
  const mockConfig: Config = {
    aiRulesDir: ".rulesync",
    outputPaths: {
      "augmentcode-legacy": ".",
      agentsmd: ".",
      amazonqcli: ".",
      augmentcode: ".augment",
      copilot: ".github",
      cursor: ".cursor",
      cline: ".",
      claudecode: ".",
      codexcli: ".",
      opencode: ".",
      qwencode: ".",
      roo: ".roo",
      geminicli: ".gemini",
      kiro: ".kiro",
      junie: ".junie",
      windsurf: ".windsurf",
    },
    watchEnabled: false,
    defaultTargets: ["augmentcode-legacy"],
  };

  it("should return empty array when no rules provided", async () => {
    const result = await generateAugmentcodeLegacyConfig([], mockConfig);

    expect(result).toEqual([]);
  });

  it("should generate legacy guidelines file for single rule", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "test.md",
        filepath: "/test/test.md",
        content: "# Test Rule\n\nThis is a test rule content.",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Test rule",
        },
      },
    ];

    const result = await generateAugmentcodeLegacyConfig(rules, mockConfig);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tool: "augmentcode-legacy",
      content: "# Test Rule\n\nThis is a test rule content.",
    });
    expect(result[0]?.filepath).toContain(".augment-guidelines");
  });

  it("should generate legacy guidelines file for multiple rules", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "rule1.md",
        filepath: "/test/rule1.md",
        content: "# Rule 1\n\nFirst rule content.",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "First rule",
        },
      },
      {
        filename: "rule2.md",
        filepath: "/test/rule2.md",
        content: "# Rule 2\n\nSecond rule content.",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Second rule",
        },
      },
    ];

    const result = await generateAugmentcodeLegacyConfig(rules, mockConfig);

    expect(result).toHaveLength(1);
    expect(result[0]?.content).toContain("# Rule 1");
    expect(result[0]?.content).toContain("# Rule 2");
    expect(result[0]?.content).toContain("First rule content.");
    expect(result[0]?.content).toContain("Second rule content.");
  });

  it("should handle rules with whitespace correctly", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "whitespace.md",
        filepath: "/test/whitespace.md",
        content: "  # Whitespace Rule  \n\n  Content with whitespace.  \n\n",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Whitespace rule",
        },
      },
    ];

    const result = await generateAugmentcodeLegacyConfig(rules, mockConfig);

    expect(result).toHaveLength(1);
    expect(result[0]?.content).toBe("# Whitespace Rule  \n\n  Content with whitespace.");
  });

  it("should use custom baseDir when provided", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "test.md",
        filepath: "/test/test-3.md",
        content: "# Test Rule",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Test rule",
        },
      },
    ];

    const customBaseDir = "/custom/output/path";
    const result = await generateAugmentcodeLegacyConfig(rules, mockConfig, customBaseDir);

    expect(result).toHaveLength(1);
    expect(result[0]?.filepath).toContain(customBaseDir);
  });

  it("should combine multiple rules with empty lines", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "rule1.md",
        filepath: "/test/rule1-2.md",
        content: "First rule content",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "First rule",
        },
      },
      {
        filename: "rule2.md",
        filepath: "/test/rule2-2.md",
        content: "Second rule content",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Second rule",
        },
      },
      {
        filename: "rule3.md",
        filepath: "/test/rule3.md",
        content: "Third rule content",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Third rule",
        },
      },
    ];

    const result = await generateAugmentcodeLegacyConfig(rules, mockConfig);

    expect(result).toHaveLength(1);
    const content = result[0]?.content;
    expect(content).toBe("First rule content\n\nSecond rule content\n\nThird rule content");
  });

  it("should handle empty rule content", async () => {
    const rules: ParsedRule[] = [
      {
        filename: "empty.md",
        filepath: "/test/empty.md",
        content: "",
        frontmatter: {
          targets: ["augmentcode-legacy"] as const,
          root: false,
          globs: ["**/*"],
          description: "Empty rule",
        },
      },
    ];

    const result = await generateAugmentcodeLegacyConfig(rules, mockConfig);

    expect(result).toHaveLength(1);
    expect(result[0]?.content).toBe("");
  });
});
