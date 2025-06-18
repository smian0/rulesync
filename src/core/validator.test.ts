import { describe, expect, it, vi } from "vitest";
import type { ParsedRule } from "../types/index.js";
import { fileExists } from "../utils/index.js";
import { validateRules } from "./validator.js";

vi.mock("../utils/index.js");

const mockFileExists = vi.mocked(fileExists);

const createMockRule = (overrides: Partial<ParsedRule> = {}): ParsedRule => ({
  filename: "test-rule.md",
  filepath: "/path/to/test-rule.md",
  frontmatter: {
    targets: ["*"],
    priority: "high",
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
      createMockRule({ filename: "duplicate.md" }),
      createMockRule({ filename: "duplicate.md" }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Duplicate rule filename: duplicate.md");
  });

  it("should warn about empty content", async () => {
    const rules = [createMockRule({ content: "   " })];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain("Rule test-rule.md has empty content");
  });

  it("should warn about short descriptions", async () => {
    const rules = [
      createMockRule({
        frontmatter: {
          targets: ["*"],
          priority: "high",
          description: "Short",
          globs: ["**/*.ts"],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain("Rule test-rule.md has a very short description");
  });

  it("should warn about missing glob patterns", async () => {
    const rules = [
      createMockRule({
        frontmatter: {
          targets: ["*"],
          priority: "high",
          description: "This is a test rule description",
          globs: [],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain("Rule test-rule.md has no glob patterns specified");
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
        filename: "problem.md",
        content: "",
        frontmatter: {
          targets: ["*"],
          priority: "high",
          description: "Bad",
          globs: [],
        },
      }),
    ];

    const result = await validateRules(rules);

    expect(result.warnings).toHaveLength(3);
    expect(result.warnings).toContain("Rule problem.md has empty content");
    expect(result.warnings).toContain("Rule problem.md has a very short description");
    expect(result.warnings).toContain("Rule problem.md has no glob patterns specified");
  });

  it("should handle empty rules array", async () => {
    const result = await validateRules([]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
