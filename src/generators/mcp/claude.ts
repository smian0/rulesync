import { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

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

export function generateClaudeMcp(
  config: RulesyncMcpConfig,
  target: "global" | "project"
): string {
  const claudeSettings: ClaudeSettings = {
    mcpServers: {}
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
    return server.rulesyncTargets.includes("claude");
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