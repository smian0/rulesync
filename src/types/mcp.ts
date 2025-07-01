export type McpTransportType = "stdio" | "sse" | "http";

export interface McpServerBase {
  command?: string;
  args?: string[];
  url?: string;
  httpUrl?: string;
  env?: Record<string, string>;
  disabled?: boolean;
  networkTimeout?: number;
  timeout?: number;
  trust?: boolean;
  cwd?: string;
  transport?: McpTransportType;
  type?: "sse" | "streamable-http";
  alwaysAllow?: string[];
  tools?: string[];
}

export interface McpConfig {
  mcpServers: Record<string, McpServerBase>;
}

export interface McpToolConfig {
  copilot?: {
    global?: boolean;
    codingAgent?: boolean;
    editor?: boolean;
  };
  cursor?: {
    global?: boolean;
    project?: boolean;
  };
  cline?: {
    global?: boolean;
    project?: boolean;
  };
  claude?: {
    global?: boolean;
    project?: boolean;
  };
  gemini?: {
    global?: boolean;
    project?: boolean;
  };
  roo?: {
    global?: boolean;
    project?: boolean;
  };
}

export interface RulesyncMcpConfig {
  servers: Record<string, McpServerBase>;
  tools?: McpToolConfig;
}