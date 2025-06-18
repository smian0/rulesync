import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateCommand } from "./generate.js";
import { generateConfigurations, parseRulesFromDirectory } from "../../core/index.js";
import { fileExists, getDefaultConfig, writeFileContent } from "../../utils/index.js";

vi.mock("../../core/index.js");
vi.mock("../../utils/index.js");

const mockGenerateConfigurations = vi.mocked(generateConfigurations);
const mockParseRulesFromDirectory = vi.mocked(parseRulesFromDirectory);
const mockFileExists = vi.mocked(fileExists);
const mockGetDefaultConfig = vi.mocked(getDefaultConfig);
const mockWriteFileContent = vi.mocked(writeFileContent);

const mockConfig = {
  aiRulesDir: ".rulesync",
  outputPaths: {
    copilot: ".github/instructions",
    cursor: ".cursor/rules",
    cline: ".clinerules",
  },
  defaultTargets: ["copilot", "cursor", "cline"],
};

const mockRules = [{
  filename: "test.md",
  filepath: ".rulesync/test.md",
  frontmatter: {
    targets: ["*"],
    priority: "high",
    description: "Test rule",
    globs: ["**/*.ts"],
  },
  content: "Test content",
}];

const mockOutputs = [{
  tool: "copilot",
  filepath: ".github/instructions/test.md",
  content: "Generated content",
}];

describe("generateCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDefaultConfig.mockReturnValue(mockConfig);
    mockFileExists.mockResolvedValue(true);
    mockParseRulesFromDirectory.mockResolvedValue(mockRules);
    mockGenerateConfigurations.mockResolvedValue(mockOutputs);
    mockWriteFileContent.mockResolvedValue();
    
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  it("should generate configurations successfully", async () => {
    await generateCommand();

    expect(mockFileExists).toHaveBeenCalledWith(".rulesync");
    expect(mockParseRulesFromDirectory).toHaveBeenCalledWith(".rulesync");
    expect(mockGenerateConfigurations).toHaveBeenCalledWith(mockRules, mockConfig, undefined);
    expect(mockWriteFileContent).toHaveBeenCalledWith(".github/instructions/test.md", "Generated content");
  });

  it("should exit if .rulesync directory does not exist", async () => {
    mockFileExists.mockResolvedValue(false);

    await expect(generateCommand()).rejects.toThrow("process.exit called");
    expect(console.error).toHaveBeenCalledWith("❌ .rulesync directory not found. Run 'rulesync init' first.");
  });

  it("should warn if no rules found", async () => {
    mockParseRulesFromDirectory.mockResolvedValue([]);

    await generateCommand();

    expect(console.warn).toHaveBeenCalledWith("⚠️  No rules found in .rulesync directory");
  });

  it("should warn if no configurations generated", async () => {
    mockGenerateConfigurations.mockResolvedValue([]);

    await generateCommand();

    expect(console.warn).toHaveBeenCalledWith("⚠️  No configurations generated");
  });

  it("should handle verbose mode", async () => {
    await generateCommand({ verbose: true });

    expect(console.log).toHaveBeenCalledWith("Parsing rules from .rulesync...");
    expect(console.log).toHaveBeenCalledWith("Found 1 rule(s)");
  });

  it("should handle specific tools option", async () => {
    await generateCommand({ tools: ["copilot"] });

    expect(mockGenerateConfigurations).toHaveBeenCalledWith(mockRules, mockConfig, ["copilot"]);
  });

  it("should handle errors gracefully", async () => {
    mockParseRulesFromDirectory.mockRejectedValue(new Error("Parse error"));

    await expect(generateCommand()).rejects.toThrow("process.exit called");
    expect(console.error).toHaveBeenCalledWith("❌ Failed to generate configurations:", expect.any(Error));
  });
});