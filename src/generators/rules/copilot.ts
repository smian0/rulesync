import { join } from "node:path";
import type { Config, GeneratedOutput, ParsedRule } from "../../types/index.js";
import { generateComplexRulesConfig } from "./shared-helpers.js";

export async function generateCopilotConfig(
  rules: ParsedRule[],
  config: Config,
  baseDir?: string,
): Promise<GeneratedOutput[]> {
  return generateComplexRulesConfig(
    rules,
    config,
    {
      tool: "copilot",
      fileExtension: ".instructions.md",
      ignoreFileName: ".copilotignore",
      generateContent: generateCopilotMarkdown,
      getOutputPath: (rule: ParsedRule, outputDir: string) => {
        const baseFilename = rule.filename.replace(/\.md$/, "");
        return join(outputDir, `${baseFilename}.instructions.md`);
      },
    },
    baseDir,
  );
}

function generateCopilotMarkdown(rule: ParsedRule): string {
  const lines: string[] = [];

  // Add Front Matter for GitHub Copilot
  lines.push("---");
  lines.push(`description: "${rule.frontmatter.description}"`);
  if (rule.frontmatter.globs.length > 0) {
    lines.push(`applyTo: "${rule.frontmatter.globs.join(", ")}"`);
  } else {
    lines.push('applyTo: "**"');
  }
  lines.push("---");

  lines.push(rule.content);

  return lines.join("\n");
}
