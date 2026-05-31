import { z } from "zod";

export const RejectionFeedbackSchema = z.object({
  ideaTitle: z.string(),
  ideaDescription: z.string(),
  format: z.enum(["stories", "reels", "carousel"]),
  businessGoal: z.enum(["followers_growth", "engagement", "organic_reach"]),
  market: z.enum(["portugal", "spain"]),
  mood: z.string().nullable(),
  targetAudience: z.string().nullable(),
  rejectionReason: z.string(),
});

export type RejectionFeedback = z.infer<typeof RejectionFeedbackSchema>;

export const IdeatorInputSchema = z.object({
  mood: z.string().min(1, "Mood e obrigatorio"),
  targetAudience: z.string().min(1, "Publico-alvo e obrigatorio"),
  market: z.enum(["portugal", "spain"]),
  format: z.enum(["stories", "reels", "carousel"]).optional(),
  businessGoal: z
    .enum(["followers_growth", "engagement", "organic_reach"])
    .optional(),
  competitorReference: z.string().optional(),
  additionalNotes: z.string().optional(),
  rejectionFeedback: z.array(RejectionFeedbackSchema).optional(),
});

export type IdeatorInput = z.infer<typeof IdeatorInputSchema>;

export const IdeatorOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string(),
        conceptDescription: z.string(),
        format: z.enum(["stories", "reels", "carousel"]),
        businessGoal: z.enum([
          "followers_growth",
          "engagement",
          "organic_reach",
        ]),
      }),
    )
    .length(3, "Devem ser geradas exatamente 3 ideias"),
});

export type IdeatorOutput = z.infer<typeof IdeatorOutputSchema>;
