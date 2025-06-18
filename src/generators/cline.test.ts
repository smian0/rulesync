import { describe, expect, it } from "vitest";
import { generateClineConfig } from "./cline.js";
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
    filename: "security.md",
    frontmatter: {
      targets: ["*"],
      priority: "high",
      description: "Security best practices",
      globs: ["**/*.ts", "**/*.js"],
    },
    content: "Always validate user input and sanitize data",
  },
  {
    filename: "styling.md",
    frontmatter: {
      targets: ["cline"],
      priority: "low",
      description: "Code styling guidelines",
      globs: ["**/*.css"],
    },
    content: "Use consistent indentation and naming conventions",
  },
];

describe("generateClineConfig", () => {
  it("should generate cline configuration with correct structure", async () => {
    const result = await generateClineConfig(mockRules, mockConfig);
    
    expect(result.tool).toBe("cline");
    expect(result.filepath).toBe(".clinerules/01-ai-rules.md");
    expect(result.content).toContain("# Cline AI Assistant Rules");
  });

  it("should separate high and low priority rules", async () => {
    const result = await generateClineConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("## High Priority Guidelines");
    expect(result.content).toContain("## Standard Guidelines");
  });

  it("should sort rules by priority (high first)", async () => {
    const result = await generateClineConfig(mockRules, mockConfig);
    
    const highSectionIndex = result.content.indexOf("## High Priority Guidelines");
    const standardSectionIndex = result.content.indexOf("## Standard Guidelines");
    
    expect(highSectionIndex).toBeLessThan(standardSectionIndex);
  });

  it("should include rule descriptions and content", async () => {
    const result = await generateClineConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("Security best practices");
    expect(result.content).toContain("Always validate user input and sanitize data");
    expect(result.content).toContain("Code styling guidelines");
    expect(result.content).toContain("Use consistent indentation and naming conventions");
  });

  it("should include file patterns", async () => {
    const result = await generateClineConfig(mockRules, mockConfig);
    
    expect(result.content).toContain("**/*.ts, **/*.js");
    expect(result.content).toContain("**/*.css");
  });

  it("should handle only high priority rules", async () => {
    const highPriorityOnly = mockRules.filter(r => r.frontmatter.priority === "high");
    const result = await generateClineConfig(highPriorityOnly, mockConfig);
    
    expect(result.content).toContain("## High Priority Guidelines");
    expect(result.content).not.toContain("## Standard Guidelines");
  });

  it("should handle only low priority rules", async () => {
    const lowPriorityOnly = mockRules.filter(r => r.frontmatter.priority === "low");
    const result = await generateClineConfig(lowPriorityOnly, mockConfig);
    
    expect(result.content).not.toContain("## High Priority Guidelines");
    expect(result.content).toContain("## Standard Guidelines");
  });

  it("should handle empty rules", async () => {
    const result = await generateClineConfig([], mockConfig);
    
    expect(result.content).toContain("# Cline AI Assistant Rules");
    expect(result.content).not.toContain("## High Priority Guidelines");
    expect(result.content).not.toContain("## Standard Guidelines");
  });

  it("should handle rules without globs", async () => {
    const rulesWithoutGlobs: ParsedRule[] = [{
      filename: "general.md",
      frontmatter: {
        targets: ["*"],
        priority: "high",
        description: "General guidelines",
        globs: [],
      },
      content: "General content",
    }];
    
    const result = await generateClineConfig(rulesWithoutGlobs, mockConfig);
    
    expect(result.content).toContain("General guidelines");
    expect(result.content).not.toContain("**Applies to files:**");
  });
});