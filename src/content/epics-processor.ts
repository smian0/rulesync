import { GenericContentProcessor } from "./generic-content-processor.js";
import { ToolTarget } from "../types/tool-targets.js";

/**
 * Processor for .claude/epics/ directory
 * Handles epic management files and project tracking
 */
export class EpicsProcessor extends GenericContentProcessor {
  constructor({ baseDir = ".", toolTarget }: { baseDir?: string; toolTarget: ToolTarget }) {
    super({ baseDir, toolTarget, contentType: "epics" });
  }

  static getToolTargets({ includeSimulated = true } = {}): ToolTarget[] {
    return GenericContentProcessor.getToolTargets({ includeSimulated });
  }
}