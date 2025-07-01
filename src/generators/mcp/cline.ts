import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

interface ClineConfig {
  mcpServers: Record<string, ClineServer>;
}

interface ClineServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  disabled?: boolean;
  alwaysAllow?: string[];
  networkTimeout?: number;
}

export function generateClineMcp(config: RulesyncMcpConfig, _target: "global" | "project"): string {
  const clineConfig: ClineConfig = {
    mcpServers: {},
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    const targets = server.rulesyncTargets;

    // If no targets or empty array, include in all tools
    if (!targets || targets.length === 0) return true;

    // If targets is ['*'], include in all tools
    if (targets.length === 1 && targets[0] === "*") return true;

    // Otherwise check if 'cline' is in the targets array
    return (targets as string[]).includes("cline");
  };

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;

    const clineServer: ClineServer = {};

    if (server.command) {
      clineServer.command = server.command;
      if (server.args) clineServer.args = server.args;
    } else if (server.url) {
      clineServer.url = server.url;
    }

    if (server.env) {
      clineServer.env = server.env;
    }

    if (server.disabled !== undefined) {
      clineServer.disabled = server.disabled;
    }

    if (server.alwaysAllow) {
      clineServer.alwaysAllow = server.alwaysAllow;
    }

    if (server.networkTimeout !== undefined) {
      clineServer.networkTimeout = server.networkTimeout;
    }

    clineConfig.mcpServers[serverName] = clineServer;
  }

  return JSON.stringify(clineConfig, null, 2);
}

export function generateClineMcpConfiguration(
  mcpServers: Record<string, RulesyncMcpServer>,
  baseDir: string = ""
): Array<{ filepath: string; content: string }> {
  const filepath = baseDir ? `${baseDir}/.cline/mcp.json` : ".cline/mcp.json";

  const config: ClineConfig = {
    mcpServers: {},
  };

  for (const [serverName, server] of Object.entries(mcpServers)) {
    // Check if this server should be included for cline
    const targets = server.rulesyncTargets;
    if (
      targets &&
      !(targets as string[]).includes("*") &&
      !(targets as string[]).includes("cline")
    ) {
      continue;
    }

    // Clone server config and remove rulesyncTargets
    const { rulesyncTargets: _, ...serverConfig } = server;
    config.mcpServers[serverName] = serverConfig;
  }

  return [
    {
      filepath,
      content: `${JSON.stringify(config, null, 2)}\n`,
    },
  ];
}
