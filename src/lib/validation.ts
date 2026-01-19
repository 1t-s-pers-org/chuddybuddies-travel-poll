import { z } from 'zod';

// Helper to sanitize and validate text input (no HTML/script tags)
const sanitizedString = (maxLength: number) =>
  z.string()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .refine(
      (val) => !/<script|<\/script|javascript:|on\w+\s*=/i.test(val),
      'Invalid characters detected'
    )
    .transform((val) => val.trim());

// Poll form submission schema
export const PollSubmissionSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .refine(
      (val) => !/<script|<\/script|javascript:|on\w+\s*=/i.test(val),
      'Invalid characters in name'
    )
    .transform((val) => val.trim()),
  firstChoice: z.string()
    .min(1, 'First choice is required')
    .max(200, 'Destination must be 200 characters or less')
    .refine(
      (val) => !/<script|<\/script|javascript:|on\w+\s*=/i.test(val),
      'Invalid characters in first choice'
    )
    .transform((val) => val.trim()),
  secondChoice: sanitizedString(200).optional().default(''),
  thirdChoice: sanitizedString(200).optional().default(''),
});

export type PollSubmission = z.infer<typeof PollSubmissionSchema>;

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Validate poll submission
export function validatePollSubmission(data: {
  name: string;
  firstChoice: string;
  secondChoice: string;
  thirdChoice: string;
}): ValidationResult<PollSubmission> {
  const result = PollSubmissionSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => err.message);
  return { success: false, errors };
}

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
