import { describe, expect, it, vi } from "vitest";
import type { ParsedRule } from "../types/index.js";
import { fileExists } from "../utils/index.js";
import { validateRules } from "./validator.js";

vi.mock("../utils/index.js");

const mockFileExists = vi.mocked(fileExists);

const createMockRule = (overrides: Partial<ParsedRule> = {}): ParsedRule => ({
  filename: "test-rule",
  filepath: "/path/to/test-rule.md",
  frontmatter: {
    targets: ["*"],
    ruleLevel: "overview",
    description: "This is a test rule description",
    globs: ["**/*.ts"],
  },
  content: "This is the rule content",
  ...overrides,
});

describe("validateRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileExists.mockResolvedValue(true);
  });

  it("should return valid result for valid rules", async () => {
    const rules = [createMockRule()];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should detect duplicate filenames", async () => {
    const rules = [
      createMockRule({ filename: "duplicate" }),
      createMockRule({ filename: "duplicate" }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Duplicate rule filename: duplicate");
  });

  it("should warn about empty content", async () => {
    const rules = [createMockRule({ content: "   " })];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain("Rule test-rule has empty content");
  });

  it("should warn about short descriptions", async () => {
    const rules = [
      createMockRule({
        frontmatter: {
          targets: ["*"],
          ruleLevel: "overview",
          description: "Short",
          globs: ["**/*.ts"],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain("Rule test-rule has a very short description");
  });

  it("should warn about missing glob patterns", async () => {
    const rules = [
      createMockRule({
        frontmatter: {
          targets: ["*"],
          ruleLevel: "overview",
          description: "This is a test rule description",
          globs: [],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain("Rule test-rule has no glob patterns specified");
  });

  it("should error when file does not exist", async () => {
    mockFileExists.mockResolvedValue(false);
    const rules = [createMockRule()];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Rule file /path/to/test-rule.md does not exist");
  });

  it("should handle multiple validation issues", async () => {
    const rules = [
      createMockRule({
        filename: "problem",
        content: "",
        frontmatter: {
          targets: ["*"],
          ruleLevel: "overview",
          description: "Bad",
          globs: [],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.warnings).toHaveLength(3);
    expect(result.warnings).toContain("Rule problem has empty content");
    expect(result.warnings).toContain("Rule problem has a very short description");
    expect(result.warnings).toContain("Rule problem has no glob patterns specified");
  });

  it("should handle empty rules array", async () => {
    const result = await validateRules([]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should validate claude target correctly", async () => {
    const rules = [
      createMockRule({
        frontmatter: {
          targets: ["claude"],
          ruleLevel: "detail",
          description: "Claude specific rule",
          globs: ["**/*.md"],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should validate mixed targets including claude", async () => {
    const rules = [
      createMockRule({
        frontmatter: {
          targets: ["copilot", "claude"],
          ruleLevel: "overview",
          description: "Rule for both copilot and claude",
          globs: ["**/*.ts", "**/*.js"],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
