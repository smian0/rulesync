import type { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

interface GeminiSettings {
  mcpServers: Record<string, GeminiServer>;
}

interface GeminiServer {
  command?: string;
  args?: string[];
  url?: string;
  httpUrl?: string;
  env?: Record<string, string>;
  timeout?: number;
  trust?: boolean;
}

export function generateGeminiCliMcp(
  config: RulesyncMcpConfig,
  target: "global" | "project"
): string {
  const geminiSettings: GeminiSettings = {
    mcpServers: {},
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    const targets = server.rulesyncTargets;

    // If no targets or empty array, include in all tools
    if (!targets || targets.length === 0) return true;

    // If targets is ['*'], include in all tools
    if (targets.length === 1 && targets[0] === "*") return true;

    // Otherwise check if 'geminicli' is in the targets array
    return (targets as string[]).includes("geminicli");
  };

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;

    const geminiServer: GeminiServer = {};

    if (server.command) {
      geminiServer.command = server.command;
      if (server.args) geminiServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      if (server.httpUrl) {
        geminiServer.httpUrl = server.httpUrl;
      } else if (server.url) {
        geminiServer.url = server.url;
      }
    }

    if (server.env) {
      geminiServer.env = {};
      for (const [key, value] of Object.entries(server.env)) {
        if (value.startsWith("${") && value.endsWith("}")) {
          geminiServer.env[key] = value;
        } else {
          geminiServer.env[key] = `\${${value}}`;
        }
      }
    }

    if (server.timeout !== undefined) {
      geminiServer.timeout = server.timeout;
    }

    if (server.trust !== undefined) {
      geminiServer.trust = server.trust;
    }

    geminiSettings.mcpServers[serverName] = geminiServer;
  }

  return JSON.stringify(geminiSettings, null, 2);
}

export function generateGeminiCliMcpConfiguration(
  mcpServers: Record<string, any>,
  baseDir: string = ""
): Array<{ filepath: string; content: string }> {
  const filepath = baseDir ? `${baseDir}/.gemini/settings.json` : ".gemini/settings.json";

  const config: GeminiSettings = {
    mcpServers: {},
  };

  for (const [serverName, server] of Object.entries(mcpServers)) {
    // Check if this server should be included for geminicli
    const targets = server.rulesyncTargets;
    if (
      targets &&
      !(targets as string[]).includes("*") &&
      !(targets as string[]).includes("geminicli")
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
