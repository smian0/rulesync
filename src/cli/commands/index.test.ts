import { describe, expect, it } from "vitest";
import * as commands from "./index.js";

describe("cli/commands/index", () => {
  it("should export all command functions", () => {
    expect(commands.addCommand).toBeDefined();
    expect(commands.generateCommand).toBeDefined();
    expect(commands.gitignoreCommand).toBeDefined();
    expect(commands.initCommand).toBeDefined();
    expect(commands.statusCommand).toBeDefined();
    expect(commands.validateCommand).toBeDefined();
    expect(commands.watchCommand).toBeDefined();
  });

  it("should export functions as expected types", () => {
    expect(typeof commands.addCommand).toBe("function");
    expect(typeof commands.generateCommand).toBe("function");
    expect(typeof commands.gitignoreCommand).toBe("function");
    expect(typeof commands.initCommand).toBe("function");
    expect(typeof commands.statusCommand).toBe("function");
    expect(typeof commands.validateCommand).toBeDefined();
    expect(typeof commands.watchCommand).toBe("function");
  });
});
