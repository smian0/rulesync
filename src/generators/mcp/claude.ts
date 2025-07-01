import { McpServerBase, RulesyncMcpConfig } from "../../types/mcp.js";

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

  const shouldInclude = (serverName: string): boolean => {
    const toolConfig = config.tools?.claude;
    if (!toolConfig) return true;
    
    if (target === "global" && toolConfig.global === false) return false;
    if (target === "project" && toolConfig.project === false) return false;
    
    return true;
  };

  for (const [serverName, server] of Object.entries(config.servers)) {
    if (!shouldInclude(serverName)) continue;
    
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