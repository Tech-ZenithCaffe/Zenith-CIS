export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "creator_portugal" | "creator_spain";
export type Market = "portugal" | "spain";
export type ContentFormat = "stories" | "reels" | "carousel";
export type ContentStatus = "draft" | "scheduled" | "published";
export type BusinessGoal = "followers_growth" | "engagement" | "organic_reach";

export interface Briefing {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: "text" | "file" | "link";
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      content_packages: {
        Row: ContentPackage;
        Insert: Omit<ContentPackage, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ContentPackage, "id" | "created_at">>;
      };
      briefings: {
        Row: Briefing;
        Insert: Omit<Briefing, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Briefing, "id" | "created_at" | "updated_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      market: Market;
      user_role: UserRole;
      content_format: ContentFormat;
      content_status: ContentStatus;
      business_goal: BusinessGoal;
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  market: Market;
  avatar_url: string | null;
  created_at: string;
}

export interface ContentPackage {
  id: string;
  idea_title: string;
  idea_description: string;
  format: ContentFormat;
  business_goal: BusinessGoal;
  market: Market;
  mood: string | null;
  target_audience: string | null;
  script_flow: Json | null;
  captions: Json | null;
  visual_prompts: Json | null;
  growth_tips: Json | null;
  scheduled_date: string | null;
  status: ContentStatus;
  is_saved: boolean;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
