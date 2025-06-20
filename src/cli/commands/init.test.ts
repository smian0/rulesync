import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureDir, fileExists, writeFileContent } from "../../utils/index.js";
import { initCommand } from "./init.js";

vi.mock("../../utils/index.js");

const mockEnsureDir = vi.mocked(ensureDir);
const mockFileExists = vi.mocked(fileExists);
const mockWriteFileContent = vi.mocked(writeFileContent);

describe("initCommand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureDir.mockResolvedValue();
    mockFileExists.mockResolvedValue(false);
    mockWriteFileContent.mockResolvedValue();

    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should initialize rulesync successfully", async () => {
    await initCommand();

    expect(mockEnsureDir).toHaveBeenCalledWith(".rulesync");
    expect(console.log).toHaveBeenCalledWith("Initializing rulesync...");
    expect(console.log).toHaveBeenCalledWith("✅ rulesync initialized successfully!");
    expect(console.log).toHaveBeenCalledWith("\nNext steps:");
    expect(console.log).toHaveBeenCalledWith("1. Edit rule files in .rulesync/");
    expect(console.log).toHaveBeenCalledWith("2. Run 'rulesync generate' to create configuration files");
  });

  it("should create sample files", async () => {
    await initCommand();

    expect(mockWriteFileContent).toHaveBeenCalledWith(
      join(".rulesync", "coding-rules.md"),
      expect.stringContaining("root: true")
    );
    expect(mockWriteFileContent).toHaveBeenCalledWith(
      join(".rulesync", "naming-conventions.md"),
      expect.stringContaining("root: false")
    );
    expect(mockWriteFileContent).toHaveBeenCalledWith(
      join(".rulesync", "architecture.md"),
      expect.stringContaining("copilot")
    );

    expect(console.log).toHaveBeenCalledWith("Created .rulesync/coding-rules.md");
    expect(console.log).toHaveBeenCalledWith("Created .rulesync/naming-conventions.md");
    expect(console.log).toHaveBeenCalledWith("Created .rulesync/architecture.md");
  });

  it("should skip existing files", async () => {
    mockFileExists.mockImplementation(async (filepath) => {
      return filepath.includes("coding-rules.md");
    });

    await initCommand();

    expect(mockWriteFileContent).toHaveBeenCalledTimes(2); // Only non-existing files
    expect(console.log).toHaveBeenCalledWith("Skipped .rulesync/coding-rules.md (already exists)");
    expect(console.log).toHaveBeenCalledWith("Created .rulesync/naming-conventions.md");
    expect(console.log).toHaveBeenCalledWith("Created .rulesync/architecture.md");
  });

  it("should handle all files existing", async () => {
    mockFileExists.mockResolvedValue(true);

    await initCommand();

    expect(mockWriteFileContent).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Skipped .rulesync/coding-rules.md (already exists)");
    expect(console.log).toHaveBeenCalledWith("Skipped .rulesync/naming-conventions.md (already exists)");
    expect(console.log).toHaveBeenCalledWith("Skipped .rulesync/architecture.md (already exists)");
  });

  it("should create proper content for root file", async () => {
    await initCommand();

    const codingRulesCall = mockWriteFileContent.mock.calls.find(call => 
      call[0].includes("coding-rules.md")
    );
    expect(codingRulesCall).toBeDefined();
    expect(codingRulesCall![1]).toContain("root: true");
    expect(codingRulesCall![1]).toContain('targets: ["*"]');
    expect(codingRulesCall![1]).toContain("General coding standards");
  });

  it("should create proper content for non-root files", async () => {
    await initCommand();

    const namingCall = mockWriteFileContent.mock.calls.find(call => 
      call[0].includes("naming-conventions.md")
    );
    expect(namingCall).toBeDefined();
    expect(namingCall![1]).toContain("root: false");
    expect(namingCall![1]).toContain("camelCase");

    const archCall = mockWriteFileContent.mock.calls.find(call => 
      call[0].includes("architecture.md")
    );
    expect(archCall).toBeDefined();
    expect(archCall![1]).toContain("root: false");
    expect(archCall![1]).toContain('targets: ["copilot", "cursor"]');
  });
});