import type { Database } from "./database";

export type ContentFormat = Database["public"]["Enums"]["content_format"];
export type ContentStatus = Database["public"]["Enums"]["content_status"];
export type BusinessGoal = Database["public"]["Enums"]["business_goal"];

export interface ContentIdea {
  id: string;
  title: string;
  conceptDescription: string;
  format: ContentFormat;
  businessGoal: BusinessGoal;
  market: "portugal" | "spain";
  mood: string | null;
  targetAudience: string | null;
  is_saved: boolean;
  image_url: string | null;
  created_at: string;
}

export interface ContentInput {
  mood: string;
  targetAudience: string;
  market: "portugal" | "spain";
  format?: ContentFormat;
  businessGoal?: BusinessGoal;
  competitorReference?: string;
  additionalNotes?: string;
}

export interface ContentPackageOutput {
  scriptFlow: Array<{
    timestamp: string;
    visualDescription: string;
    audioOrOverlay: string;
  }>;
  captions: {
    primaryLanguage: string;
    primaryText: string;
    englishTranslation?: string;
  };
  visualPrompts: {
    midjourneyPrompts: string[];
    runwayPrompts: string[];
  };
  growthTips: {
    callToActions: string[];
    engagementStickers?: {
      pollQuestion?: string;
      questionBox?: string;
    };
    suggestedHashtags: string[];
    suggestedGeoTags: string[];
  };
}

export type StreamEvent =
  | { step: "copywriting"; status: "started" }
  | { step: "copywriting"; data: Pick<ContentPackageOutput, "scriptFlow" | "captions"> }
  | { step: "prompting"; status: "started" }
  | { step: "prompting"; data: Pick<ContentPackageOutput, "visualPrompts"> }
  | { step: "growth"; status: "started" }
  | { step: "growth"; data: Pick<ContentPackageOutput, "growthTips"> }
  | { step: "complete"; packageId: string };
