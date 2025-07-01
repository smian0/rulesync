import { describe, it, expect } from "vitest";
import { generateCopilotMcp } from "../copilot.js";
import { RulesyncMcpConfig } from "../../../types/mcp.js";

describe("generateCopilotMcp", () => {
  it("should generate Copilot Coding Agent config", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "COPILOT_MCP_SECRET" }
        }
      }
    };

    const result = generateCopilotMcp(config, "codingAgent");
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      mcpServers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "COPILOT_MCP_SECRET" }
        }
      }
    });
  });

  it("should generate Copilot Editor config with inputs", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "MY_SECRET_KEY" }
        }
      }
    };

    const result = generateCopilotMcp(config, "editor");
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      servers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          env: { API_KEY: "${input:test-server_API_KEY}" }
        }
      },
      inputs: [{
        id: "test-server_API_KEY",
        type: "password",
        description: "API_KEY for test-server"
      }]
    });
  });

  it("should handle URL-based servers", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "http-server": {
          httpUrl: "http://localhost:3000",
          tools: ["*"]
        }
      }
    };

    const result = generateCopilotMcp(config, "editor");
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      servers: {
        "http-server": {
          url: "http://localhost:3000",
          tools: ["*"]
        }
      }
    });
  });

  it("should convert alwaysAllow to tools", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "test-server": {
          command: "node",
          args: ["server.js"],
          alwaysAllow: ["tool1", "tool2"]
        }
      }
    };

    const result = generateCopilotMcp(config, "codingAgent");
    const parsed = JSON.parse(result);

    expect(parsed.mcpServers["test-server"].tools).toEqual(["tool1", "tool2"]);
  });

  it("should respect tools configuration", () => {
    const config: RulesyncMcpConfig = {
      servers: {
        "server1": { command: "node", args: ["s1.js"] },
        "server2": { command: "node", args: ["s2.js"] }
      },
      tools: {
        copilot: { codingAgent: false, editor: true }
      }
    };

    const result = generateCopilotMcp(config, "codingAgent");
    const parsed = JSON.parse(result);

    expect(parsed.mcpServers).toEqual({});
  });
});