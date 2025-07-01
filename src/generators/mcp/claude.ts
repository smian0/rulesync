import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

interface ClaudeSettings {
  mcpServers?: Record<string, ClaudeServer>;
}

interface ClaudeServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  transport?: "sse" | "http";
}

export function generateClaudeMcp(config: RulesyncMcpConfig, target: "global" | "project"): string {
  const claudeSettings: ClaudeSettings = {
    mcpServers: {},
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    // If no rulesyncTargets specified, include in all tools
    if (!server.rulesyncTargets || server.rulesyncTargets.length === 0) {
      return true;
    }

    // If rulesyncTargets is ['*'], include in all tools
    if (server.rulesyncTargets.length === 1 && server.rulesyncTargets[0] === "*") {
      return true;
    }

    // Check if 'claude' is in the rulesyncTargets array
    return (server.rulesyncTargets as string[]).includes("claude");
  };

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;

    const claudeServer: ClaudeServer = {};

    if (server.command) {
      claudeServer.command = server.command;
      if (server.args) claudeServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        claudeServer.url = url;
      }
      if (server.httpUrl) {
        claudeServer.transport = "http";
      } else if (server.transport === "sse") {
        claudeServer.transport = "sse";
      }
    }

    if (server.env) {
      claudeServer.env = server.env;
    }

    claudeSettings.mcpServers![serverName] = claudeServer;
  }

  return JSON.stringify(claudeSettings, null, 2);
}

export function generateClaudeMcpConfiguration(
  mcpServers: Record<string, any>,
  baseDir: string = ""
): Array<{ filepath: string; content: string }> {
  const filepath = baseDir ? `${baseDir}/.claude/settings.json` : ".claude/settings.json";

  const settings: ClaudeSettings = {
    mcpServers: {},
  };

  for (const [serverName, server] of Object.entries(mcpServers)) {
    // Check if this server should be included for claude
    const targets = server.rulesyncTargets;
    if (targets && !targets.includes("*") && !targets.includes("claudecode")) {
      continue;
    }

    // Clone server config and remove rulesyncTargets
    const { rulesyncTargets, ...serverConfig } = server;
    settings.mcpServers![serverName] = serverConfig;
  }

  return [
    {
      filepath,
      content: JSON.stringify(settings, null, 2) + "\n",
    },
  ];
}
