import { BaseAgent } from "../base-agent";
import {
  type IdeatorInput,
  type IdeatorOutput,
  IdeatorInputSchema,
  IdeatorOutputSchema,
} from "./types";

/**
 * Agente A: Ideator
 *
 * Recebe um formulário estruturado (mood, público, mercado)
 * e gera 3 ideias conceituais de conteúdo.
 */
export class IdeatorAgent extends BaseAgent<IdeatorInput, IdeatorOutput> {
  readonly name = "ideator";

  constructor() {
    super(
      [
        "Você é o Ideator do Zenith Caffè, um especialista em conteúdo criativo para redes sociais.",
        "Sua tarefa é gerar 3 ideias conceituais de posts com base no briefing fornecido.",
        "",
        "REGRAS:",
        "- Pense primeiro nas emoções e experiências sensoriais",
        "- Use linguagem visual e descritiva",
        "- Cada ideia deve ter um formato E um objetivo de negócio diferentes",
        "- Evite repetir conceitos de ideias anteriores",
        "- Retorne estritamente um objeto JSON válido, sem markdown envolvente",
        "- O JSON DEVE seguir EXATAMENTE este formato (substituindo os valores de exemplo):",
        "{",
        '  "ideas": [',
        "    {",
        '      "title": "Título criativo da ideia",',
        '      "conceptDescription": "Descrição detalhada do conceito",',
        '      "format": "reels",',
        '      "businessGoal": "engagement"',
        "    },",
        "    {",
        '      "title": "Outro título criativo",',
        '      "conceptDescription": "Outra descrição detalhada",',
        '      "format": "carousel",',
        '      "businessGoal": "followers_growth"',
        "    },",
        "    {",
        '      "title": "Mais um título criativo",',
        '      "conceptDescription": "Mais uma descrição detalhada",',
        '      "format": "stories",',
        '      "businessGoal": "organic_reach"',
        "    }",
        "  ]",
        "}",
        "- REGRA: format DEVE ser um destes valores (inglês, minúsculo): stories, reels, carousel",
        "- REGRA: businessGoal DEVE ser um destes valores (inglês, minúsculo): followers_growth, engagement, organic_reach",
        "- REGRA: Cada ideia deve ter format E businessGoal diferentes entre as 3 ideias",
      ].join("\n"),
    );
  }

  async execute(input: IdeatorInput): Promise<IdeatorOutput> {
    const validated = IdeatorInputSchema.parse(input);

    const prompt = [
      `## Briefing de Conteúdo`,
      `**Mood/Atmosfera**: ${validated.mood}`,
      `**Público-alvo**: ${validated.targetAudience}`,
      `**Mercado**: ${validated.market === "portugal" ? "Portugal" : "Espanha"}`,
      validated.format &&
        `**Formato preferencial**: ${validated.format}`,
      validated.businessGoal &&
        `**Objetivo de negócio**: ${validated.businessGoal}`,
      validated.competitorReference &&
        `**Referência de concorrência**: ${validated.competitorReference}`,
      validated.additionalNotes &&
        `**Notas adicionais**: ${validated.additionalNotes}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      return await this.generateValidated(prompt, IdeatorOutputSchema);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("429") || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
        console.warn("[IdeatorAgent] Quota Gemini excedida — a usar fallback local");
        return this.generateFallback(validated);
      }
      throw error;
    }
  }

  private generateFallback(input: IdeatorInput): IdeatorOutput {
    const market = input.market === "portugal" ? "Portugal" : "Espanha";
    const moodLabels: Record<string, string> = {
      inspirador: "Inspiração",
      divertido: "Diversão",
      elegante: "Elegância",
      educativo: "Educação",
      autêntico: "Autenticidade",
      sazonal: "Sazonalidade",
    };
    const mood = moodLabels[input.mood] ?? input.mood;

    const formats: Array<"stories" | "reels" | "carousel"> = ["stories", "reels", "carousel"];
    const goals: Array<"followers_growth" | "engagement" | "organic_reach"> = [
      "followers_growth",
      "engagement",
      "organic_reach",
    ];
    const shuffledFormats = [...formats].sort(() => Math.random() - 0.5);
    const shuffledGoals = [...goals].sort(() => Math.random() - 0.5);

    const ideas: IdeatorOutput["ideas"] = shuffledFormats.map((format, i) => ({
      title: `${mood} em ${market} — Ideia ${i + 1}`,
      conceptDescription: `Conteúdo focado em ${mood.toLowerCase()} para o público ${input.targetAudience} em ${market}.`,
      format,
      businessGoal: shuffledGoals[i] ?? "engagement",
    }));

    return { ideas };
  }
}
