import { z } from "zod/v4";
import { RulesyncTargetsSchema, ToolTargets } from "./tool-targets.js";

export const McpTransportTypeSchema = z.enum(["stdio", "sse", "http"]);

export const McpServerBaseSchema = z.object({
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().optional(),
  httpUrl: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  disabled: z.boolean().optional(),
  networkTimeout: z.number().optional(),
  timeout: z.number().optional(),
  trust: z.boolean().optional(),
  cwd: z.string().optional(),
  transport: McpTransportTypeSchema.optional(),
  type: z.enum(["sse", "streamable-http"]).optional(),
  alwaysAllow: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

export const RulesyncMcpServerSchema = McpServerBaseSchema.extend({
  targets: RulesyncTargetsSchema.optional(),
});

export type ParsedRulesyncTargets = z.infer<typeof RulesyncTargetsSchema>;
export type ParsedRulesyncMcpServer = z.infer<typeof RulesyncMcpServerSchema>;

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
  targets?: ToolTargets | ["*"];
}

export interface McpConfig {
  mcpServers: Record<string, McpServerBase>;
}

export interface RulesyncMcpConfig {
  mcpServers: Record<string, RulesyncMcpServer>;
}
