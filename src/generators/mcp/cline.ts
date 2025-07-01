import { RulesyncMcpConfig, RulesyncMcpServer } from "../../types/mcp.js";

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

export function generateClineMcp(
  config: RulesyncMcpConfig,
  target: "global" | "project"
): string {
  const clineConfig: ClineConfig = {
    mcpServers: {}
  };

  const shouldInclude = (server: RulesyncMcpServer): boolean => {
    const targets = server.rulesyncTargets;
    
    // If no targets or empty array, include in all tools
    if (!targets || targets.length === 0) return true;
    
    // If targets is ['*'], include in all tools
    if (targets.length === 1 && targets[0] === '*') return true;
    
    // Otherwise check if 'cline' is in the targets array
    return targets.includes('cline');
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