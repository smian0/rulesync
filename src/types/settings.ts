import { z } from "zod/v4";

export const ClaudeSettingsSchema = z.object({
  permissions: z
    .object({
      deny: z.array(z.string()).default([]),
    })
    .default({ deny: [] }),
});

export type ClaudeSettings = z.infer<typeof ClaudeSettingsSchema>;
