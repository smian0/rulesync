import type { ToolTarget } from "./rules.js";

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

export interface RulesyncMcpServer extends McpServerBase {
  rulesyncTargets?: ToolTarget[] | ["*"];
}

export interface McpConfig {
  mcpServers: Record<string, McpServerBase>;
}

export interface RulesyncMcpConfig {
  mcpServers: Record<string, RulesyncMcpServer>;
}
