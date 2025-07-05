import { z } from "zod/v4";

export const ClaudeSettingsSchema = z.looseObject({
  permissions: z
    .looseObject({
      deny: z.array(z.string()).default([]),
    })
    .default({ deny: [] }),
});

export type ClaudeSettings = z.infer<typeof ClaudeSettingsSchema>;
