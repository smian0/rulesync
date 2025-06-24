import { describe, expect, it } from "vitest";
import type { Config, ParsedRule } from "../types/index.js";
import { generateRooConfig } from "./roo.js";

describe("generateRooConfig", () => {
  const mockConfig: Config = {
    aiRulesDir: ".rulesync",
    outputPaths: {
      copilot: ".github/instructions",
      cursor: ".cursor/rules",
      cline: ".clinerules",
      claudecode: ".",
      roo: ".roo/rules",
    },
    watchEnabled: false,
    defaultTargets: ["copilot", "cursor", "cline", "claudecode", "roo"],
  };

  it("should generate basic Roo configuration", async () => {
    const rules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["roo"],
          description: "Test rule",
          globs: ["**/*.ts"],
        },
        content: "Use TypeScript best practices",
        filename: "typescript",
        filepath: ".rulesync/typescript.md",
      },
    ];

    const outputs = await generateRooConfig(rules, mockConfig);

    expect(outputs).toHaveLength(1);
    expect(outputs[0]).toEqual({
      tool: "roo",
      filepath: ".roo/rules/typescript.md",
      content: "Use TypeScript best practices",
    });
  });

  it("should handle multiple rules", async () => {
    const rules: ParsedRule[] = [
      {
        frontmatter: {
          root: true,
          targets: ["roo"],
          description: "Coding standards",
          globs: [],
        },
        content: "Follow the coding standards",
        filename: "standards",
        filepath: ".rulesync/standards.md",
      },
      {
        frontmatter: {
          root: false,
          targets: ["roo"],
          description: "Testing guidelines",
          globs: ["**/*.test.ts"],
        },
        content: "Write comprehensive tests",
        filename: "testing",
        filepath: ".rulesync/testing.md",
      },
    ];

    const outputs = await generateRooConfig(rules, mockConfig);

    expect(outputs).toHaveLength(2);
    expect(outputs[0].filepath).toBe(".roo/rules/standards.md");
    expect(outputs[1].filepath).toBe(".roo/rules/testing.md");
  });

  it("should format content with description header", async () => {
    const rules: ParsedRule[] = [
      {
        frontmatter: {
          root: false,
          targets: ["roo"],
          description: "API documentation",
          globs: ["**/*.api.ts"],
        },
        content: "Document all public APIs\n\nInclude examples for complex functions",
        filename: "api-docs",
        filepath: ".rulesync/api-docs.md",
      },
    ];

    const outputs = await generateRooConfig(rules, mockConfig);

    expect(outputs[0].content).toBe(
      "Document all public APIs\n\nInclude examples for complex functions"
    );
  });
});
