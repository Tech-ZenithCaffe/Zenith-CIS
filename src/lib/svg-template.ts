type IdeaData = {
  title: string;
  description: string | null;
  format: string | null;
  targetAudience: string | null;
  mood: string | null;
};

const MOOD_COLORS: Record<string, { bg: string[]; accent: string; text: string }> = {
  professional: {
    bg: ["#1e3a5f", "#0f1b2d"],
    accent: "#3b82f6",
    text: "#ffffff",
  },
  luxury: {
    bg: ["#1a1a2e", "#0f0f1a"],
    accent: "#f59e0b",
    text: "#ffffff",
  },
  educational: {
    bg: ["#065f46", "#022c22"],
    accent: "#10b981",
    text: "#ffffff",
  },
  fun: {
    bg: ["#7c3aed", "#4c1d95"],
    accent: "#f472b6",
    text: "#ffffff",
  },
  casual: {
    bg: ["#d97706", "#92400e"],
    accent: "#fbbf24",
    text: "#ffffff",
  },
  energetic: {
    bg: ["#dc2626", "#7f1d1d"],
    accent: "#fbbf24",
    text: "#ffffff",
  },
  calm: {
    bg: ["#0d9488", "#134e4a"],
    accent: "#5eead4",
    text: "#ffffff",
  },
};

const FORMAT_LABELS: Record<string, string> = {
  stories: "Stories",
  reels: "Reels",
  carousel: "Carrossel",
  post: "Post",
};

function getColors(mood: string | null) {
  return MOOD_COLORS[mood?.toLowerCase() ?? ""] ?? {
    bg: ["#1e3a5f", "#0f1b2d"],
    accent: "#3b82f6",
    text: "#ffffff",
  };
}

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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateSvg(data: IdeaData): string {
  const { w, h } = getDimensions(data.format);
  const colors = getColors(data.mood);
  const [color1, color2] = colors.bg;

  const title = escapeXml(data.title || "Sem título");
  const description = escapeXml(data.description || "");
  const formatLabel = FORMAT_LABELS[data.format ?? ""] ?? data.format ?? "Conteúdo";
  const audience = escapeXml(data.targetAudience || "");

  const titleFontSize = Math.min(Math.floor(w / 18), 36);
  const descFontSize = Math.min(Math.floor(w / 30), 18);

  const titleLines = wrapText(title, 28);
  const descLines = description ? wrapText(description, 50) : [];

  const titleY = h * 0.35;
  const descY = titleY + titleLines.length * (titleFontSize * 1.4) + 24;

  let circles = "";
  const circlePositions = [
    { cx: w * 0.85, cy: h * 0.15, r: w * 0.2, opacity: 0.08 },
    { cx: w * 0.1, cy: h * 0.1, r: w * 0.15, opacity: 0.06 },
    { cx: w * 0.9, cy: h * 0.8, r: w * 0.25, opacity: 0.05 },
    { cx: w * 0.2, cy: h * 0.9, r: w * 0.12, opacity: 0.07 },
  ];
  for (const c of circlePositions) {
    circles += `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${colors.accent}" opacity="${c.opacity}" />\n`;
  }

  let titleSvg = "";
  for (let i = 0; i < titleLines.length; i++) {
    const lineY = titleY + i * (titleFontSize * 1.3);
    titleSvg += `<text x="${w / 2}" y="${lineY}" font-family="system-ui, -apple-system, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="${colors.text}" text-anchor="middle">${titleLines[i]}</text>\n`;
  }

  let descSvg = "";
  for (let i = 0; i < descLines.length; i++) {
    const lineY = descY + i * (descFontSize * 1.5);
    descSvg += `<text x="${w / 2}" y="${lineY}" font-family="system-ui, -apple-system, sans-serif" font-size="${descFontSize}" fill="${colors.text}" opacity="0.85" text-anchor="middle">${descLines[i]}</text>\n`;
  }

  const audienceY = h - 60;
  let audienceSvg = "";
  if (audience) {
    audienceSvg = `<text x="${w / 2}" y="${audienceY}" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${colors.text}" opacity="0.5" text-anchor="middle">🎯 ${audience}</text>\n`;
  }

  const badgeX = w / 2;
  const badgeY = h * 0.18;
  const badgeW = Math.min(formatLabel.length * 9 + 32, w * 0.6);
  const badgeH = 28;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)" rx="12" />
  ${circles}
  <rect x="${badgeX - badgeW / 2}" y="${badgeY - badgeH / 2}" width="${badgeW}" height="${badgeH}" rx="${badgeH / 2}" fill="${colors.accent}" opacity="0.2" />
  <text x="${badgeX}" y="${badgeY + 5}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="${colors.accent}" text-anchor="middle" letter-spacing="1">${formatLabel}</text>
  ${titleSvg}
  ${descSvg}
  <line x1="${w * 0.25}" y1="${h - 90}" x2="${w * 0.75}" y2="${h - 90}" stroke="${colors.accent}" stroke-width="2" opacity="0.3" />
  <text x="${w / 2}" y="${h - 30}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="${colors.text}" opacity="0.3" text-anchor="middle" letter-spacing="2">ZENITH</text>
  ${audienceSvg}
</svg>`;
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  if (!text || text.length === 0) return [""];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxCharsPerLine) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}
