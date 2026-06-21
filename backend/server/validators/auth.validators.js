import { z } from 'zod';

const optionalText = (schema) => z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, schema.optional());

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    nickname: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_.]+$/),
    collegeName: z.string().min(2, "College name must be at least 2 characters").max(120),
    branch: z.string().min(2),
    year: z.coerce.number().min(1).max(6),
    gender: z.enum(['woman', 'man', 'non_binary', 'prefer_not']).default('prefer_not')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const otpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6)
  })
});

export const emailSchema = z.object({ body: z.object({ email: z.string().email() }) });

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    password: z.string().min(8)
  })
});
