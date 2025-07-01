import { RulesyncMcpConfig } from "../../types/mcp.js";

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

export function generateGeminiMcp(
  config: RulesyncMcpConfig,
  target: "global" | "project"
): string {
  const geminiSettings: GeminiSettings = {
    mcpServers: {}
  };

  const shouldInclude = (serverName: string): boolean => {
    const toolConfig = config.tools?.gemini;
    if (!toolConfig) return true;
    
    if (target === "global" && toolConfig.global === false) return false;
    if (target === "project" && toolConfig.project === false) return false;
    
    return true;
  };

  for (const [serverName, server] of Object.entries(config.servers)) {
    if (!shouldInclude(serverName)) continue;
    
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