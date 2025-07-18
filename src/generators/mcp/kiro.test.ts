import { describe, expect, it } from "vitest";
import type { ToolTarget } from "../../types/tool-targets.js";
import { generateKiroMcpConfiguration } from "./kiro.js";

describe("generateKiroMcpConfiguration", () => {
  it("should generate Kiro MCP configuration with all servers", () => {
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

    const result = generateKiroMcpConfiguration(mcpServers);

    expect(result).toHaveLength(1);
    expect(result[0]!.filepath).toBe(".kiro/mcp.json");

    const config = JSON.parse(result[0]!.content);
    expect(config.mcpServers).toEqual(mcpServers);
  });

  it("should filter servers by targets", () => {
    const mcpServers = {
      server1: {
        command: "server1",
        targets: ["kiro", "claudecode"],
      },
      server2: {
        command: "server2",
        targets: ["claudecode"],
      },
      server3: {
        command: "server3",
        targets: ["*"],
      },
    } satisfies Record<
      string,
      {
        command: string;
        targets: ToolTarget[] | ["*"];
      }
    >;

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(Object.keys(config.mcpServers)).toHaveLength(2);
    expect(config.mcpServers).toHaveProperty("server1");
    expect(config.mcpServers).toHaveProperty("server3");
    expect(config.mcpServers).not.toHaveProperty("server2");
  });

  it("should include servers without targets", () => {
    const mcpServers = {
      server1: {
        command: "server1",
      },
    };

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers).toHaveProperty("server1");
  });

  it("should exclude targets from output", () => {
    const mcpServers = {
      server1: {
        command: "server1",
        args: ["--stdio"],
        targets: ["kiro"],
      },
    } satisfies Record<
      string,
      {
        command: string;
        args: string[];
        targets: ToolTarget[] | ["*"];
      }
    >;

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers.server1).toEqual({
      command: "server1",
      args: ["--stdio"],
    });
    expect(config.mcpServers.server1).not.toHaveProperty("targets");
  });

  it("should handle Kiro-specific autoApprove/autoBlock fields", () => {
    const mcpServers = {
      "aws-server": {
        command: "python",
        args: ["-m", "aws_mcp_server"],
        kiroAutoApprove: ["describe_instances", "list_buckets"],
        kiroAutoBlock: ["delete_bucket", "terminate_instances"],
      },
    };

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers["aws-server"]).toEqual({
      command: "python",
      args: ["-m", "aws_mcp_server"],
      autoApprove: ["describe_instances", "list_buckets"],
      autoBlock: ["delete_bucket", "terminate_instances"],
    });
    expect(config.mcpServers["aws-server"]).not.toHaveProperty("kiroAutoApprove");
    expect(config.mcpServers["aws-server"]).not.toHaveProperty("kiroAutoBlock");
  });

  it("should handle SSE server configuration", () => {
    const mcpServers = {
      "remote-server": {
        url: "https://inventory.example.com/mcp",
        timeout: 120000,
        transport: "sse" as const,
      },
    };

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers["remote-server"]).toEqual({
      url: "https://inventory.example.com/mcp",
      timeout: 120000,
      transport: "sse",
    });
  });

  it("should handle httpUrl by converting to url", () => {
    const mcpServers = {
      "http-server": {
        httpUrl: "https://example.com/mcp",
        transport: "http" as const,
      },
    };

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers["http-server"]).toEqual({
      url: "https://example.com/mcp",
      transport: "http",
    });
    expect(config.mcpServers["http-server"]).not.toHaveProperty("httpUrl");
  });

  it("should handle empty servers object", () => {
    const result = generateKiroMcpConfiguration({});
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers).toEqual({});
  });

  it("should support baseDir parameter", () => {
    const mcpServers = {
      "test-server": {
        command: "test",
      },
    };

    const result = generateKiroMcpConfiguration(mcpServers, "/custom/path");
    expect(result[0]!.filepath).toBe("/custom/path/.kiro/mcp.json");
  });

  it("should format JSON with proper indentation", () => {
    const mcpServers = {
      server: {
        command: "test",
        args: ["arg1", "arg2"],
      },
    };

    const result = generateKiroMcpConfiguration(mcpServers);

    // Check that JSON is properly formatted
    expect(result[0]!.content).toContain('  "mcpServers": {');
    expect(result[0]!.content).toContain('    "server": {');
    expect(result[0]!.content).toContain('      "command": "test"');
  });

  it("should handle mixed configuration with various fields", () => {
    const mcpServers = {
      "complex-server": {
        command: "python",
        args: ["-m", "complex_server"],
        env: {
          AWS_PROFILE: "dev",
          AWS_REGION: "us-east-1",
        },
        timeout: 180000,
        disabled: false,
        kiroAutoApprove: ["read_operation"],
        kiroAutoBlock: ["write_operation"],
        targets: ["kiro"],
      },
    } satisfies Record<
      string,
      {
        command: string;
        args: string[];
        env: Record<string, string>;
        timeout: number;
        disabled: boolean;
        kiroAutoApprove: string[];
        kiroAutoBlock: string[];
        targets: ToolTarget[] | ["*"];
      }
    >;

    const result = generateKiroMcpConfiguration(mcpServers);
    const config = JSON.parse(result[0]!.content);

    expect(config.mcpServers["complex-server"]).toEqual({
      command: "python",
      args: ["-m", "complex_server"],
      env: {
        AWS_PROFILE: "dev",
        AWS_REGION: "us-east-1",
      },
      timeout: 180000,
      disabled: false,
      autoApprove: ["read_operation"],
      autoBlock: ["write_operation"],
    });
    expect(config.mcpServers["complex-server"]).not.toHaveProperty("targets");
    expect(config.mcpServers["complex-server"]).not.toHaveProperty("kiroAutoApprove");
    expect(config.mcpServers["complex-server"]).not.toHaveProperty("kiroAutoBlock");
  });
});
