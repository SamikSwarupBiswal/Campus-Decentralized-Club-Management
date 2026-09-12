import { z } from "zod";

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address")
  .transform((value) => value.toLowerCase() as `0x${string}`);

export const authChallengeSchema = z.object({
  address: addressSchema,
});

export const authVerifySchema = z.object({
  rememberMe: z.boolean().default(false),
  address: addressSchema,
  message: z.string().min(20).max(1_000),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
});

export const attendanceChallengeSchema = z.object({
  eventId: z.string().min(3).max(120).regex(/^[a-zA-Z0-9_-]+$/),
  wallet: addressSchema,
});

export const attendanceCheckInSchema = z.preprocess(
  (raw: unknown) => {
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      if ("e" in obj || "w" in obj || "n" in obj) {
        return {
          eventId: obj.eventId ?? obj.e,
          wallet: obj.wallet ?? obj.w,
          timestamp: obj.timestamp ?? obj.t,
          nonce: obj.nonce ?? obj.n,
          message: obj.message ?? obj.m,
          signature: obj.signature ?? obj.s,
        };
      }
    }
    return raw;
  },
  z.object({
    eventId: z.string().min(3).max(120).regex(/^[a-zA-Z0-9_-]+$/),
    wallet: addressSchema,
    timestamp: z.number().int().positive(),
    nonce: z.string().length(48).regex(/^[a-f0-9]+$/),
    message: z.string().min(30).max(1_200).optional(),
    signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
  }),
);

export const memberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  studentId: z.string().trim().min(3).max(40),
  wallet: addressSchema,
  department: z.string().trim().min(2).max(120),
  year: z.string().trim().min(2).max(30),
});

export const eventSchema = z
  .object({
    name: z.string().trim().min(3).max(140),
    description: z.string().trim().min(10).max(2_500),
    date: z.string().date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    venue: z.string().trim().min(2).max(160),
    organizer: z.string().trim().min(2).max(120),
    proposalId: z.string().trim().max(80).optional().or(z.literal("")),
  })
  .refine((value) => value.endTime > value.startTime, {
    path: ["endTime"],
    message: "End time must be after start time",
  });

export const proposalSchema = z.object({
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(120, "Title cannot exceed 120 characters"),
  category: z.enum(["Treasury", "Events", "Operations", "Community"]),
  duration: z.coerce.number().int().min(1).max(30).default(7),
  description: z.string().trim().min(40, "Description must be at least 40 characters").max(5_000, "Description is too long"),
  recipient: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid recipient address")
    .optional()
    .or(z.literal("")),
  amount: z.string().trim().max(30).optional().or(z.literal("")),
  metadataHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid metadata hash")
    .optional(),
  proposer: addressSchema.optional(),
});
