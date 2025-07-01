import { describe, expect, it } from "vitest";
import * as generators from "./index.js";

describe("generators/index", () => {
  it("should export all generator functions", () => {
    expect(generators.generateClaudecodeConfig).toBeDefined();
    expect(generators.generateClineConfig).toBeDefined();
    expect(generators.generateCopilotConfig).toBeDefined();
    expect(generators.generateCursorConfig).toBeDefined();
    expect(generators.generateRooConfig).toBeDefined();
  });

  it("should export functions as expected types", () => {
    expect(typeof generators.generateClaudecodeConfig).toBe("function");
    expect(typeof generators.generateClineConfig).toBe("function");
    expect(typeof generators.generateCopilotConfig).toBe("function");
    expect(typeof generators.generateCursorConfig).toBe("function");
    expect(typeof generators.generateRooConfig).toBe("function");
  });
});
