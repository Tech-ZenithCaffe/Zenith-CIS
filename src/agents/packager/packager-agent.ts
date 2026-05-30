import { BaseAgent } from "../base-agent";
import {
  type PackagerInput,
  type PackagerOutput,
  PackagerInputSchema,
  PackagerOutputSchema,
} from "./types";

/**
 * Agente B: Packager
 *
 * Recebe uma ideia aprovada e gera o pacote completo.
 */
export class PackagerAgent extends BaseAgent<PackagerInput, PackagerOutput> {
  readonly name = "packager";

  constructor() {
    super(
      [
        "Você é o Packager do Zenith Caffè, um especialista em produção de conteúdo completo.",
        "Sua tarefa é gerar um pacote completo de conteúdo para redes sociais.",
        "",
        "REGRAS DE IDIOMA:",
        "- Se o formato for 'stories': textos em Inglês (EN)",
        "- Se o mercado for 'portugal': legenda em PT-PT (NUNCA PT-BR) + versão EN",
        "- Se o mercado for 'spain': legenda em ES-ES + versão EN",
        "",
        "REGRAS DE CONTEÚDO:",
        "- Foque em experiências sensoriais e lifestyle",
        "- Use o tom premium da marca (nunca mencionar preços ou promoções)",
        "- Gere prompts visuais profissionais para Midjourney v6 e Runway",
        "- Proponha CTAs criativos que gerem interação real",
        "- Retorne estritamente um objeto JSON válido",
      ].join("\n"),
    );
  }

  async execute(input: PackagerInput): Promise<PackagerOutput> {
    const validated = PackagerInputSchema.parse(input);

    const prompt = [
      `## Ideia Aprovada`,
      `**Título**: ${validated.title}`,
      `**Descrição**: ${validated.conceptDescription}`,
      `**Formato**: ${validated.format}`,
      `**Objetivo**: ${validated.businessGoal}`,
      `**Mercado**: ${validated.market === "portugal" ? "Portugal" : "Espanha"}`,
      `**Mood**: ${validated.mood}`,
      `**Público-alvo**: ${validated.targetAudience}`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.generateValidated(prompt, PackagerOutputSchema);
  }
}
