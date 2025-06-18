import { describe, expect, it } from "vitest";
import { generateCursorConfig } from "./cursor.js";
import type { Config, ParsedRule } from "../types/index.js";

const mockConfig: Config = {
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
  },
  defaultTargets: ["copilot", "cursor", "cline"],
};

const mockRules: ParsedRule[] = [
  {
    filename: "high-priority.md",
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
  it("should generate cursor configuration with correct structure", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    expect(result.tool).toBe("cursor");
    expect(result.filepath).toBe(".cursor/rules/ai-rules.md");
    expect(result.content).toContain("# Cursor IDE Rules");
  });

  it("should sort rules by priority (high first)", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    const highPriorityIndex = result.content.indexOf("high-priority.md");
    const lowPriorityIndex = result.content.indexOf("low-priority.md");
    
    expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);
  });

  it("should include priority badges", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("🔴 HIGH");
    expect(result.content).toContain("🟡 STANDARD");
  });

  it("should include file patterns in globs", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    expect(result.content).toContain('globs: ["**/*.ts", "**/*.js"]');
    expect(result.content).toContain('globs: ["**/*.md"]');
  });

  it("should set alwaysApply correctly based on priority", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("alwaysApply: true");
    expect(result.content).toContain("alwaysApply: false");
  });

  it("should handle empty rules", async () => {
    const result = await generateCursorConfig([], mockConfig);
    
    expect(result.content).toContain("# Cursor IDE Rules");
    expect(result.content).not.toContain("🔴 HIGH");
  });

  it("should include rule descriptions", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("High priority rule");
    expect(result.content).toContain("Low priority rule");
  });

  it("should include rule content", async () => {
    const result = await generateCursorConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("This is a high priority rule content");
    expect(result.content).toContain("This is a low priority rule content");
  });
});