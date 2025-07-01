import { describe, expect, it } from "vitest";
import { generateRooMcpConfiguration } from "./roo";

describe("generateRooMcpConfiguration", () => {
  it("should generate Roo MCP configuration with all servers", () => {
    const mcpServers = {
      "language-server": {
        command: "language-server",
        args: ["--stdio"],
        env: { DEBUG: "false" },
      },
      "api-server": {
        url: "http://localhost:5000/mcp",
        headers: { "X-Custom-Header": "value" },
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);

    expect(result).toHaveLength(1);
    expect(result[0].filepath).toBe(".roo/mcp.json");

    const config = JSON.parse(result[0].content);
    expect(config.mcpServers).toEqual(mcpServers);
  });

  it("should filter servers by rulesyncTargets", () => {
    const mcpServers = {
      server1: {
        command: "server1",
        rulesyncTargets: ["roo", "claude"],
      },
      server2: {
        command: "server2",
        rulesyncTargets: ["claude", "cursor"],
      },
      server3: {
        command: "server3",
        rulesyncTargets: ["*"],
      },
      server4: {
        command: "server4",
        // No targets means all tools
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(Object.keys(config.mcpServers)).toHaveLength(3);
    expect(config.mcpServers).toHaveProperty("server1");
    expect(config.mcpServers).toHaveProperty("server3");
    expect(config.mcpServers).toHaveProperty("server4");
    expect(config.mcpServers).not.toHaveProperty("server2");
  });

  it("should exclude rulesyncTargets from output", () => {
    const mcpServers = {
      "custom-server": {
        command: "custom",
        args: ["--config", "roo.json"],
        env: { MODE: "production" },
        rulesyncTargets: ["roo"],
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers["custom-server"]).toEqual({
      command: "custom",
      args: ["--config", "roo.json"],
      env: { MODE: "production" },
    });
    expect(config.mcpServers["custom-server"]).not.toHaveProperty("rulesyncTargets");
  });

  it("should handle empty servers object", () => {
    const result = generateRooMcpConfiguration({});
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers).toEqual({});
  });

  it("should support baseDir parameter", () => {
    const mcpServers = {
      "test-server": {
        command: "test",
      },
    };

    const result = generateRooMcpConfiguration(mcpServers, "/projects/my-app");
    expect(result[0].filepath).toBe("/projects/my-app/.roo/mcp.json");
  });

  it("should handle servers with minimal configuration", () => {
    const mcpServers = {
      "minimal-stdio": {
        command: "minimal",
      },
      "minimal-http": {
        url: "http://localhost:8080",
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers["minimal-stdio"]).toEqual({
      command: "minimal",
    });
    expect(config.mcpServers["minimal-http"]).toEqual({
      url: "http://localhost:8080",
    });
  });

  it("should handle complex server configurations", () => {
    const mcpServers = {
      "complex-server": {
        command: "complex-server",
        args: ["--port", "3000", "--mode", "advanced", "--verbose"],
        env: {
          NODE_ENV: "production",
          LOG_LEVEL: "info",
          CUSTOM_VAR: "value",
        },
        rulesyncTargets: ["*"],
      },
      "http-server": {
        url: "https://api.example.com/mcp/v2",
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          "X-API-Version": "2.0",
          Accept: "application/json",
        },
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers["complex-server"]).toEqual({
      command: "complex-server",
      args: ["--port", "3000", "--mode", "advanced", "--verbose"],
      env: {
        NODE_ENV: "production",
        LOG_LEVEL: "info",
        CUSTOM_VAR: "value",
      },
    });
    expect(config.mcpServers["http-server"]).toEqual({
      url: "https://api.example.com/mcp/v2",
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        "X-API-Version": "2.0",
        Accept: "application/json",
      },
    });
  });

  it("should format JSON with proper indentation", () => {
    const mcpServers = {
      server: {
        url: "http://example.com",
        headers: {
          "X-Header-1": "value1",
          "X-Header-2": "value2",
        },
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);

    // Check that JSON is properly formatted
    expect(result[0].content).toContain('  "mcpServers": {');
    expect(result[0].content).toContain('    "server": {');
    expect(result[0].content).toContain('      "url": "http://example.com"');
    expect(result[0].content).toContain('      "headers": {');
    expect(result[0].content).toContain('        "X-Header-1": "value1"');
  });

  it("should handle server names with special characters", () => {
    const mcpServers = {
      "server-with-dash": {
        command: "server1",
      },
      server_with_underscore: {
        command: "server2",
      },
      "server.with.dots": {
        command: "server3",
      },
    };

    const result = generateRooMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0].content);

    expect(config.mcpServers).toHaveProperty("server-with-dash");
    expect(config.mcpServers).toHaveProperty("server_with_underscore");
    expect(config.mcpServers).toHaveProperty("server.with.dots");
  });
});
