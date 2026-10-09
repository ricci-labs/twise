import { z } from 'zod'

export const workspacePickerSearchSchema = z.object({
  lost: z.boolean().optional().catch(undefined),
})
