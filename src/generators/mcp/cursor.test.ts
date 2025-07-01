import { describe, expect, it } from "vitest";
import { generateCursorMcpConfiguration } from "./cursor";

describe("generateCursorMcpConfiguration", () => {
  it("should generate Cursor MCP configuration with all servers", () => {
    const mcpServers = {
      "typescript-server": {
        command: "typescript-language-server",
        args: ["--stdio"],
        env: { NODE_ENV: "development" },
      },
      "eslint-server": {
        command: "eslint-server",
        args: ["--stdio"],
      },
    };

    const result = generateCursorMcpConfiguration(mcpServers);

    expect(result).toHaveLength(1);
    expect(result[0].filepath).toBe(".cursor/mcp.json");
    
    const config = JSON.parse(result[0].content);
    expect(config.mcpServers).toEqual(mcpServers);
  });

  it("should filter servers by rulesyncTargets", () => {
    const mcpServers = {
      "server1": {
        command: "server1",
        rulesyncTargets: ["cursor", "claude"],
      },
      "server2": {
        command: "server2",
        rulesyncTargets: ["claude"],
      },
      "server3": {
        command: "server3",
        rulesyncTargets: ["*"],
      },
    };

    const result = generateCursorMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(Object.keys(config.mcpServers)).toHaveLength(2);
    expect(config.mcpServers).toHaveProperty("server1");
    expect(config.mcpServers).toHaveProperty("server3");
    expect(config.mcpServers).not.toHaveProperty("server2");
  });

  it("should include servers without rulesyncTargets", () => {
    const mcpServers = {
      "server1": {
        command: "server1",
      },
    };

    const result = generateCursorMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers).toHaveProperty("server1");
  });

  it("should exclude rulesyncTargets from output", () => {
    const mcpServers = {
      "server1": {
        command: "server1",
        args: ["--stdio"],
        rulesyncTargets: ["cursor"],
      },
    };

    const result = generateCursorMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers.server1).toEqual({
      command: "server1",
      args: ["--stdio"],
    });
    expect(config.mcpServers.server1).not.toHaveProperty("rulesyncTargets");
  });

  it("should handle empty servers object", () => {
    const result = generateCursorMcpConfiguration({});
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers).toEqual({});
  });

  it("should support baseDir parameter", () => {
    const mcpServers = {
      "test-server": {
        command: "test",
      },
    };

    const result = generateCursorMcpConfiguration(mcpServers, "/custom/path");
    expect(result[0].filepath).toBe("/custom/path/.cursor/mcp.json");
  });

  it("should format JSON with proper indentation", () => {
    const mcpServers = {
      "server": {
        command: "test",
        args: ["arg1", "arg2"],
      },
    };

    const result = generateCursorMcpConfiguration(mcpServers);
    
    // Check that JSON is properly formatted
    expect(result[0].content).toContain("  \"mcpServers\": {");
    expect(result[0].content).toContain("    \"server\": {");
    expect(result[0].content).toContain("      \"command\": \"test\"");
  });
});