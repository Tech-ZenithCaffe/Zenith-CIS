type IdeaData = {
  title: string;
  description: string | null;
  format: string | null;
  targetAudience: string | null;
  mood: string | null;
};

function getDimensions(format: string | null): { w: number; h: number } {
  switch (format) {
    case "stories":
    case "reels":
      return { w: 540, h: 960 };
    case "carousel":
      return { w: 540, h: 540 };
    default:
      return { w: 540, h: 540 };
  }
}

export async function generateImage(data: IdeaData): Promise<Buffer> {
  const { w, h } = getDimensions(data.format);

  const moodStyles: Record<string, string> = {
    professional: "corporate style, clean lighting",
    luxury: "elegant, premium质感, gold accents",
    educational: "clean academic style, infographic aesthetic",
    fun: "playful, vibrant colors, energetic",
    casual: "warm, relaxed, natural light",
    energetic: "dynamic composition, bold colors",
    calm: "soft tones, minimalist, serene",
  };

  const moodStyle = moodStyles[data.mood?.toLowerCase() ?? ""] ?? "modern, professional";

  const prompt = [
    data.description || data.title,
    `Format: ${data.format || "social media post"}.`,
    moodStyle,
    `Target: ${data.targetAudience || "general"}.`,
    "Photorealistic, high quality, well composed, suitable for social media.",
    "No text, no typography, no watermarks.",
  ].join(" ");

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pollinations error ${res.status}: ${text.slice(0, 200)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
