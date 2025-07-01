import { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

interface RooConfig {
  mcpServers: Record<string, RooServer>;
}

interface RooServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  disabled?: boolean;
  alwaysAllow?: string[];
  networkTimeout?: number;
  type?: "sse" | "streamable-http";
}

export function generateRooMcp(
  config: RulesyncMcpConfig,
  target: "global" | "project"
): string {
  const rooConfig: RooConfig = {
    mcpServers: {}
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    const targets = server.rulesyncTargets;
    
    // If no targets or empty array, include in all tools
    if (!targets || targets.length === 0) return true;
    
    // If targets is ['*'], include in all tools
    if (targets.length === 1 && targets[0] === '*') return true;
    
    // Otherwise check if 'roo' is in the targets array
    return targets.includes('roo');
  };

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    if (!shouldInclude(server)) continue;
    
    const rooServer: RooServer = {};
    
    if (server.command) {
      rooServer.command = server.command;
      if (server.args) rooServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        rooServer.url = url;
      }
      if (server.httpUrl || server.transport === "http") {
        rooServer.type = "streamable-http";
      } else if (server.transport === "sse" || server.type === "sse") {
        rooServer.type = "sse";
      }
    }
    
    if (server.env) {
      rooServer.env = {};
      for (const [key, value] of Object.entries(server.env)) {
        if (value.startsWith("${env:") && value.endsWith("}")) {
          rooServer.env[key] = value;
        } else {
          rooServer.env[key] = `\${env:${value}}`;
        }
      }
    }
    
    if (server.disabled !== undefined) {
      rooServer.disabled = server.disabled;
    }
    
    if (server.alwaysAllow) {
      rooServer.alwaysAllow = server.alwaysAllow;
    }
    
    if (server.networkTimeout !== undefined) {
      rooServer.networkTimeout = Math.max(30000, Math.min(300000, server.networkTimeout));
    }
    
    rooConfig.mcpServers[serverName] = rooServer;
  }
  
  return JSON.stringify(rooConfig, null, 2);
}