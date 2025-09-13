import { z } from "zod/mini";
import { type ValidationResult } from "../types/ai-file.js";
import {
  RulesyncFile,
  type RulesyncFileParams,
} from "../types/rulesync-file.js";
import { stringifyFrontmatter } from "../utils/frontmatter.js";

export const GenericRulesyncFileFrontmatterSchema = z.object({
  contentType: z.optional(z.string()),
  source: z.optional(z.string()),
});

export type GenericRulesyncFileFrontmatter = z.infer<typeof GenericRulesyncFileFrontmatterSchema>;

export interface GenericRulesyncFileParams extends RulesyncFileParams {
  fileName: string;
  frontmatter: GenericRulesyncFileFrontmatter;
  body: string;
}

/**
 * Generic RulesyncFile implementation for any Claude Code content type
 */
export class GenericRulesyncFile extends RulesyncFile {
  private readonly frontmatter: GenericRulesyncFileFrontmatter;
  private readonly body: string;

  constructor({ fileName, frontmatter, body, ...rest }: GenericRulesyncFileParams) {
    // Validate frontmatter before calling super to avoid validation order issues
    if (rest.validate !== false) {
      const result = GenericRulesyncFileFrontmatterSchema.safeParse(frontmatter);
      if (!result.success) {
        throw result.error;
      }
    }

    super({
      ...rest,
      relativeDirPath: ".rulesync/content",
      relativeFilePath: `${fileName}.md`,
      fileContent: stringifyFrontmatter(body, frontmatter),
    });

    this.frontmatter = frontmatter;
    this.body = body;
  }

  getFrontmatter(): GenericRulesyncFileFrontmatter {
    return this.frontmatter;
  }

  getBody(): string {
    return this.body;
  }

  getFileName(): string {
    return this.getRelativeFilePath().replace('.md', '');
  }

  validate(): ValidationResult {
    // Check if frontmatter is set (may be undefined during construction)
    if (!this.frontmatter) {
      return { success: true, error: null };
    }

    // Validate frontmatter structure
    const result = GenericRulesyncFileFrontmatterSchema.safeParse(this.frontmatter);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Ensure we have some body content
    if (!this.body || this.body.trim().length === 0) {
      return {
        success: false,
        error: new Error("Generic content must have body content")
      };
    }

    return { success: true, error: null };
  }
}