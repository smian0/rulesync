import { RulesyncMcpConfig } from "../../types/mcp.js";

interface CopilotEditorConfig {
  servers: Record<string, CopilotServer>;
  inputs?: CopilotInput[];
}

interface CopilotCodingAgentConfig {
  mcpServers: Record<string, CopilotServer>;
}

interface CopilotServer {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  tools?: string[];
}

interface CopilotInput {
  id: string;
  type: "password";
  description: string;
}

export function generateCopilotMcp(
  config: RulesyncMcpConfig,
  target: "codingAgent" | "editor"
): string {
  const shouldInclude = (serverName: string): boolean => {
    const toolConfig = config.tools?.copilot;
    if (!toolConfig) return true;
    
    if (target === "codingAgent" && toolConfig.codingAgent === false) return false;
    if (target === "editor" && toolConfig.editor === false) return false;
    
    return true;
  };

  const servers: Record<string, CopilotServer> = {};
  const inputs: CopilotInput[] = [];
  const inputMap = new Map<string, string>();

  for (const [serverName, server] of Object.entries(config.servers)) {
    if (!shouldInclude(serverName)) continue;
    
    const copilotServer: CopilotServer = {};
    
    if (server.command) {
      copilotServer.command = server.command;
      if (server.args) copilotServer.args = server.args;
    } else if (server.url || server.httpUrl) {
      const url = server.httpUrl || server.url;
      if (url) {
        copilotServer.url = url;
      }
    }
    
    if (server.env) {
      copilotServer.env = {};
      for (const [key, value] of Object.entries(server.env)) {
        if (target === "editor" && value.includes("SECRET")) {
          const inputId = `${serverName}_${key}`;
          inputMap.set(inputId, value);
          copilotServer.env[key] = `\${input:${inputId}}`;
          inputs.push({
            id: inputId,
            type: "password",
            description: `${key} for ${serverName}`
          });
        } else {
          copilotServer.env[key] = value;
        }
      }
    }
    
    if (server.tools) {
      copilotServer.tools = server.tools;
    } else if (server.alwaysAllow) {
      copilotServer.tools = server.alwaysAllow;
    }
    
    servers[serverName] = copilotServer;
  }
  
  if (target === "codingAgent") {
    const config: CopilotCodingAgentConfig = { mcpServers: servers };
    return JSON.stringify(config, null, 2);
  } else {
    const config: CopilotEditorConfig = { servers };
    if (inputs.length > 0) {
      config.inputs = inputs;
    }
    return JSON.stringify(config, null, 2);
  }
}