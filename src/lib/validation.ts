import { z } from 'zod';

// Vote schema for import validation
export const VoteSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  firstChoice: z.string().max(200),
  secondChoice: z.string().max(200),
  thirdChoice: z.string().max(200),
  createdAt: z.string(),
  updatedAt: z.string(),
  excluded: z.boolean().optional(),
});

// Weight config schema for import validation
export const WeightConfigSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  first: z.number().int().min(0).max(1000),
  second: z.number().int().min(0).max(1000),
  third: z.number().int().min(0).max(1000),
});

// Import data schema
export const ImportDataSchema = z.object({
  votes: z.array(VoteSchema).optional(),
  weightConfig: WeightConfigSchema.optional(),
  exportedAt: z.string().optional(),
});

// Type exports
export type ValidatedVote = z.infer<typeof VoteSchema>;
export type ValidatedWeightConfig = z.infer<typeof WeightConfigSchema>;
export type ValidatedImportData = z.infer<typeof ImportDataSchema>;
