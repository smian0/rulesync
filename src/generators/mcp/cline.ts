import { RulesyncMcpConfig } from "../../types/mcp.js";

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

  const shouldInclude = (serverName: string): boolean => {
    const toolConfig = config.tools?.cline;
    if (!toolConfig) return true;
    
    if (target === "global" && toolConfig.global === false) return false;
    if (target === "project" && toolConfig.project === false) return false;
    
    return true;
  };

  for (const [serverName, server] of Object.entries(config.servers)) {
    if (!shouldInclude(serverName)) continue;
    
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