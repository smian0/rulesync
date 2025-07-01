import { describe, it, expect } from "vitest";
import { generateClaudeMcp } from "../claude.js";
import { RulesyncMcpConfig } from "../../../types/mcp.js";

describe("generateClaudeMcp", () => {
  it("should generate Claude MCP config for stdio transport", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "test-key" }
        }
      }
    };

    const result = generateClaudeMcp(config, "project");
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "test-key" }
        }
      }
    });
  });

  it("should generate Claude MCP config for SSE transport", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "sse-server": {
          url: "http://localhost:3000",
          transport: "sse"
        }
      }
    };

    const result = generateClaudeMcp(config, "project");
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "sse-server": {
          url: "http://localhost:3000",
          transport: "sse"
        }
      }
    });
  });

  it("should generate Claude MCP config for HTTP transport", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "http-server": {
          httpUrl: "http://localhost:3000",
          env: { API_KEY: "test-key" }
        }
      }
    };

    const result = generateClaudeMcp(config, "project");
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "http-server": {
          url: "http://localhost:3000",
          transport: "http",
          env: { API_KEY: "test-key" }
        }
      }
    });
  });

  it("should respect tools configuration for global target", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "server1": { command: "node", args: ["s1.js"] },
        "server2": { command: "node", args: ["s2.js"] }
      },
      tools: {
        claude: { global: false, project: true }
      }
    };

    const result = generateClaudeMcp(config, "global");
    const parsed = JSON.parse(result);

    expect(parsed.mcpServers).toEqual({});
  });

  it("should include all servers when tools config is not specified", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "server1": { command: "node", args: ["s1.js"] },
        "server2": { command: "python", args: ["s2.py"] }
      }
    };

    const result = generateClaudeMcp(config, "project");
    const parsed = JSON.parse(result);

    expect(Object.keys(parsed.mcpServers)).toHaveLength(2);
    expect(parsed.mcpServers).toHaveProperty("server1");
    expect(parsed.mcpServers).toHaveProperty("server2");
  });
});