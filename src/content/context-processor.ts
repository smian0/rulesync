import { GenericContentProcessor } from "./generic-content-processor.js";
import { ToolTarget } from "../types/tool-targets.js";

/**
 * Processor for .claude/context/ directory
 * Handles project context, documentation, and configuration files
 */
export class ContextProcessor extends GenericContentProcessor {
  constructor({ baseDir = ".", toolTarget }: { baseDir?: string; toolTarget: ToolTarget }) {
    super({ baseDir, toolTarget, contentType: "context" });
  }

  static getToolTargets({ includeSimulated = true } = {}): ToolTarget[] {
    return GenericContentProcessor.getToolTargets({ includeSimulated });
  }
}