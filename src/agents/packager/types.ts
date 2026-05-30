import { z } from "zod";

export const PackagerInputSchema = z.object({
  title: z.string(),
  conceptDescription: z.string(),
  format: z.enum(["stories", "reels", "carousel"]),
  businessGoal: z.enum(["followers_growth", "engagement", "organic_reach"]),
  market: z.enum(["portugal", "spain"]),
  mood: z.string(),
  targetAudience: z.string(),
});

export type PackagerInput = z.infer<typeof PackagerInputSchema>;

export const PackagerOutputSchema = z.object({
  scriptFlow: z.array(
    z.object({
      timestamp: z.string(),
      visualDescription: z.string(),
      audioOrOverlay: z.string(),
    }),
  ),
  captions: z.object({
    primaryLanguage: z.string(),
    primaryText: z.string(),
    englishTranslation: z.string().optional(),
  }),
  visualPrompts: z.object({
    midjourneyPrompts: z.array(z.string()),
    runwayPrompts: z.array(z.string()),
  }),
  growthTips: z.object({
    callToActions: z.array(z.string()),
    engagementStickers: z
      .object({
        pollQuestion: z.string().optional(),
        questionBox: z.string().optional(),
      })
      .optional(),
    suggestedHashtags: z.array(z.string()),
    suggestedGeoTags: z.array(z.string()),
  }),
});

export type PackagerOutput = z.infer<typeof PackagerOutputSchema>;
