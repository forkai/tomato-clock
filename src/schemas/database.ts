import { z } from 'zod'
import { SessionTypeSchema } from './timer'

export const SessionRecordSchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  duration: z.number().int().positive(),
  type: SessionTypeSchema,
  completedAt: z.number().int()
})

export type SessionRecordInput = z.infer<typeof SessionRecordSchema>
