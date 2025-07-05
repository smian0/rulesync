import { describe, expect, it } from "vitest";
import type { RulesyncMcpConfig } from "../../types/mcp.js";
import { generateClaudeMcp } from "./claudecode.js";

describe("generateClaudeMcp", () => {
  it("should generate Claude MCP config for stdio transport", () => {
    const config: RulesyncMcpConfig = {
      mcpServers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "test-key" },
        },
      },
    };

    const result = generateClaudeMcp(config);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "test-key" },
        },
      },
    });
  });

  it("should generate Claude MCP config for SSE transport", () => {
    const config: RulesyncMcpConfig = {
      mcpServers: {
        "sse-server": {
          url: "http://localhost:3000",
          transport: "sse",
        },
      },
    };

    const result = generateClaudeMcp(config);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "sse-server": {
          url: "http://localhost:3000",
          transport: "sse",
        },
      },
    });
  });

  it("should generate Claude MCP config for HTTP transport", () => {
    const config: RulesyncMcpConfig = {
      mcpServers: {
        "http-server": {
          httpUrl: "http://localhost:3000",
          env: { API_KEY: "test-key" },
        },
      },
    };

    const result = generateClaudeMcp(config);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "http-server": {
          url: "http://localhost:3000",
          transport: "http",
          env: { API_KEY: "test-key" },
        },
      },
    });
  });

  it("should respect targets configuration", () => {
    const config: RulesyncMcpConfig = {
      mcpServers: {
        server1: { command: "node", args: ["s1.js"], targets: ["cursor"] },
        server2: { command: "node", args: ["s2.js"], targets: ["claudecode"] },
      },
    };

    const result = generateClaudeMcp(config);
    const parsed = JSON.parse(result);

    expect(Object.keys(parsed.mcpServers)).toHaveLength(1);
    expect(parsed.mcpServers).toHaveProperty("server2");
  });

  it("should include all servers when tools config is not specified", () => {
    const config: RulesyncMcpConfig = {
      mcpServers: {
        server1: { command: "node", args: ["s1.js"] },
        server2: { command: "python", args: ["s2.py"] },
      },
    };

    const result = generateClaudeMcp(config);
    const parsed = JSON.parse(result);

    expect(Object.keys(parsed.mcpServers)).toHaveLength(2);
    expect(parsed.mcpServers).toHaveProperty("server1");
    expect(parsed.mcpServers).toHaveProperty("server2");
  });
});
