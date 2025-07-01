import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

interface CursorConfig {
  mcpServers: Record<string, CursorServer>;
}

interface CursorServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  cwd?: string;
  type?: "sse" | "streamable-http";
}

export function generateCursorMcp(config: RulesyncMcpConfig, target: "global" | "project"): string {
  const cursorConfig: CursorConfig = {
    mcpServers: {},
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    const targets = server.rulesyncTargets;

    // If no targets or empty array, include in all tools
    if (!targets || targets.length === 0) return true;

    // If targets is ['*'], include in all tools
    if (targets.length === 1 && targets[0] === "*") return true;

    // Otherwise check if 'cursor' is in the targets array
    return (targets as string[]).includes("cursor");
  };

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;

    const cursorServer: CursorServer = {};

    if (server.command) {
      cursorServer.command = server.command;
      if (server.args) cursorServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        cursorServer.url = url;
      }
      if (server.httpUrl || server.transport === "http") {
        cursorServer.type = "streamable-http";
      } else if (server.transport === "sse" || server.type === "sse") {
        cursorServer.type = "sse";
      }
    }

    if (server.env) {
      cursorServer.env = server.env;
    }

    if (server.cwd) {
      cursorServer.cwd = server.cwd;
    }

    cursorConfig.mcpServers[serverName] = cursorServer;
  }

  return JSON.stringify(cursorConfig, null, 2);
}

export function generateCursorMcpConfiguration(
  mcpServers: Record<string, any>,
  baseDir: string = ""
): Array<{ filepath: string; content: string }> {
  const filepath = baseDir ? `${baseDir}/.cursor/mcp.json` : ".cursor/mcp.json";

  const config: CursorConfig = {
    mcpServers: {},
  };

  for (const [serverName, server] of Object.entries(mcpServers)) {
    // Check if this server should be included for cursor
    const targets = server.rulesyncTargets;
    if (
      targets &&
      !(targets as string[]).includes("*") &&
      !(targets as string[]).includes("cursor")
    ) {
      continue;
    }

    // Clone server config and remove rulesyncTargets
    const { rulesyncTargets, ...serverConfig } = server;
    config.mcpServers[serverName] = serverConfig;
  }

  return [
    {
      filepath,
      content: JSON.stringify(config, null, 2) + "\n",
    },
  ];
}
