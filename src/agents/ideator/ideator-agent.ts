import { BaseAgent } from "../base-agent";
import {
  type IdeatorInput,
  type IdeatorOutput,
  IdeatorInputSchema,
  IdeatorOutputSchema,
} from "./types";
import type { RejectionFeedback } from "./types";

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

    const feedbackLines = (validated.rejectionFeedback ?? []).map(
      (f: RejectionFeedback) =>
        `- Ideia rejeitada: "${f.ideaTitle}" (${f.format}, ${f.businessGoal}) — Motivo: ${f.rejectionReason}`,
    );

    const feedbackBlock =
      feedbackLines.length > 0
        ? [
            ``,
            `## Feedback de Rejeições Anteriores`,
            `As seguintes ideias foram rejeitadas pelo utilizador em gerações anteriores.`,
            `Analisa os padrões e EVITA criar ideias semelhantes:`,
            ...feedbackLines,
          ].join("\n")
        : "";

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
      feedbackBlock,
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
    const audience = input.targetAudience;

    type Concept = {
      title: string;
      description: string;
    };

    const seeds: Record<string, Concept[]> = {
      inspirador: [
        { title: "O café que mudou o meu dia", description: `Narrativa POV de 30s: um cliente ${audience} conta como uma xícara de café ${market === "Portugal" ? "à portuguesa" : "a la española"} transformou uma manhã comum num momento de pausa e clareza. Close-ups do creme, luz natural da manhã, som ambiente da máquina de espresso. A mensagem: "Às vezes, o que precisamos está mesmo à nossa frente."` },
        { title: "Rituais que merecem ser vividos", description: `Série de 3 fotos estilo editorial: (1) mãos a segurar uma caneca de cerâmica artesanal com espuma decorada, (2) grãos de café espalhados sobre uma mesa de madeira com luz dourada, (3) o primeiro gole capturado em câmara lenta. Legenda com micro-poema sobre rituais matinais. Hashtags de slow living e bem-estar.` },
        { title: "O som do silêncio (e do café a passar)", description: `Vídeo ASMR de 15s para Stories: o som do moinho a moer grãos, da água a ferver, do café a pingar no filtro de pano. Nenhuma música, apenas sons reais. Texto sobreposto: "Faz uma pausa. Inspira. Espira. Bebe." Call-to-action: "Guarda este story para veres amanhã de manhã 🌅"` },
      ],
      divertido: [
        { title: "Perguntámos à máquina de café qual é o melhor café", description: `Vídeo TikTok-style (9:16) com montagem rápida: a equipa a fazer perguntas à máquina de café e a interpretar as respostas nos ecrãs. Cortes rápidos, música upbeat, legendas engraçadas. No final, revelação: "Ela prefere o nosso blend 💀" Ideal para partilhas e comentários.` },
        { title: "Como sobreviver a uma segunda-feira (versão café)", description: `Carrossel de 5 slides com ilustrações divertidas: Slide 1 — "Acordar: ☕"; Slide 2 — "Trânsito mental: ☕☕"; Slide 3 — "Reunião das 9: ☕☕☕"; até ao Slide 5 — "Missão cumprida. Hora do próximo café." Tom descontraído, linguagem de meme. Público ${audience} identifica-se.` },
        { title: "O teste do paladar (versão cega)", description: `Reels de 45s: três membros da equipa provam 3 cafés diferentes de venda- olhos vendados. Reações genuínas, expressões exageradas, tentativas de descrever notas de degustação de forma cómica ("sabe a... abraço da avó?"). No fim, cada um escolhe o seu favorito. Musica animada, cortes rápidos.` },
      ],
      elegante: [
        { title: "A arte da xícara perfeita", description: `Produção visual de alto padrão para feed. Fotos em preto e branco com um único ponto de cor — o dourado do café. Close-ups macro da textura da espuma, grãos iluminados por luz rasante, porcelana artesanal. Copy minimalista: "O luxo está nos detalhes. Ou, neste caso, no creme." Público ${audience} aspiracional.` },
        { title: "O café como experiência sensorial", description: `Vídeo slow cinema para Reels: plano sequência de 20s sem cortes. Da seleção do grão ao serviço na mesa. Câmara em travelling lateral, luz natural, sem pressa. Banda sonora: piano minimalista. Legenda: "O tempo não é dinheiro. O tempo é café." Ideal para ${market} com estética visual requintada.` },
        { title: "Maridagem: café e chocolate", description: `Guia visual de harmonização em carrossel: 4 combinações café + chocolate, cada uma com nota de degustação, origem e perfil sensorial. Fotografia estilo still life com fundo de mármore e talheres prateados. Legenda sofisticada mas acessível: "A combinação que o seu paladar merece."` },
      ],
      educativo: [
        { title: "Farm to Cup: a jornada do nosso grão", description: `Série educativa em 3 partes para Reels. Episódio 1: origem do grão (visuals da plantação, produtores locais). Episódio 2: processo de torra (temperatura, tempo, arte). Episódio 3: extração (métodos, dicas para ${audience} fazerem em casa). Tom informativo mas caloroso. Gráficos explicativos animados.` },
        { title: "Guia do iniciante: 3 métodos de preparo", description: `Carrossel interativo com 6 slides. Slide 1: qual método escolher? Slide 2-3: V60 vs Aeropress vs French Press (prós/contra, dificuldade, tempo). Slide 4: tabela comparativa visual. Slide 5: dicas de ${audience}. Slide 6: call-to-action para visitar a loja. Design limpo, ícones minimalistas, informação hierarquizada.` },
        { title: "Desmistificar os blends: o que significa cada nota?", description: `Vídeo educativo para Reels com animação de ecrã dividido. De um lado, um copo de café visível — do outro, ícones animados representando notas de degustação (caramelo, fruta, chocolate, frutos secos). Locução calma e didática: "Quando dizemos 'notas de caramelo', estamos a falar disto..." Ideal para ${audience} curioso.` },
      ],
      autêntico: [
        { title: "Um dia na vida do nosso barista", description: `Vlog-style vertical de 60s: segue um barista do Zenith durante um turno. Preparação da máquina, interação com clientes ${audience}, arte latte, limpeza do espaço. Voz off genuína do barista. Sem guião — momentos reais. Legenda: "Isto não é teatro. É paixão pelo que fazemos."` },
        { title: "O cantinho do café: os nossos clientes", description: `Série de Stories ao longo de um dia: fotografias espontâneas de clientes no espaço do ${market === "Portugal" ? "Bairro Alto" : "El Born"}, com as suas bebidas favoritas. Pergunta interativa: "Qual é a tua bebida de eleição?" Cada story destaca uma pessoa diferente com uma frase sua sobre o café.` },
        { title: "Porque é que este café não é para toda a gente", description: `Carrossel provocador de 4 slides. Slide 1: close-up do grão. Texto curto: "Isto não é café de supermercado." Slide 2: processo artesanal. "Não é produção em massa." Slide 3: o nosso cliente. "É para quem valoriza o trabalho manual." Slide 4: call-to-action. "Se és desses, vem conhecer-nos." Tom honesto e sem filtros.` },
      ],
      sazonal: [
        { title: `${market === "Portugal" ? "Natal à mesa" : "Navidad en la mesa"} com o nosso blend especial`, description: `Campanha de Natal em 3 Reels. (1) Preparação de café com especiarias sazonais (canela, cardamomo, laranja). (2) Embrulho presenteável dos blends especiais para oferta. (3) Mesa posta com cafés e doces típicos de ${market}. Hashtags sazonais, tom acolhedor e familiar. Música ambiente natalícia.` },
        { title: "Verão: a época dos gelados de café", description: `Vídeo refrescante para Reels: preparação de 3 receitas de café gelado — Nitro Cold Brew, Affogato com gelado artesanal, Shaken Espresso com citrinos. Cores vibrantes, gelo a estalar, copos transpirados. Som ambiente de verão. Call-to-action: "Salva esta receita para o próximo calor ☀️"` },
        { title: "Primavera no teu bairro", description: `Série de Stories a descobrir os melhores sítios para beber café ao ar livre em ${market === "Portugal" ? "Lisboa" : "Barcelona"}. Cada story: uma esplanada diferente, o café Zenith numa caneca para viagem, moldura verde com plantas. Sondagem: "Qual é a tua esplanada favorita?" Conteúdo sazonal e local.` },
      ],
    };

    const moodKey = input.mood;
    const brandSeeds: Concept[] = seeds[moodKey] ?? seeds.inspirador ?? [];

    const extraNotes = [
      input.competitorReference && `Referência: ${input.competitorReference}`,
      input.additionalNotes && `Notas: ${input.additionalNotes}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const formatPool: Array<"stories" | "reels" | "carousel"> = ["stories", "reels", "carousel"];
    const goalPool: Array<"followers_growth" | "engagement" | "organic_reach"> = [
      "followers_growth",
      "engagement",
      "organic_reach",
    ];

    const preferredFormat = input.format;
    const preferredGoal = input.businessGoal;

    const usedFormats = new Set<string>();
    const usedGoals = new Set<string>();
    const usedConceptIdxs = new Set<number>();

    const ideas: IdeatorOutput["ideas"] = [];

    for (let i = 0; i < 3; i++) {
      const available = brandSeeds
        .map((c, idx) => ({ c, idx }))
        .filter(({ idx }) => !usedConceptIdxs.has(idx));
      const seed = available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : null;
      const concept: Concept = seed?.c ?? brandSeeds[i % brandSeeds.length] ?? {
        title: `${market === "Portugal" ? "Inspiração" : "Inspiración"} para o teu café`,
        description: `Conteúdo personalizado para o público ${audience} em ${market}.`,
      };
      usedConceptIdxs.add(seed?.idx ?? -1);

      let format: "stories" | "reels" | "carousel";
      if (preferredFormat && i === 0) {
        format = preferredFormat;
      } else {
        const available = formatPool.filter((f) => !usedFormats.has(f));
        format = (available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : formatPool[Math.floor(Math.random() * formatPool.length)])!;
      }
      usedFormats.add(format);

      let goal: "followers_growth" | "engagement" | "organic_reach";
      if (preferredGoal && i === 0) {
        goal = preferredGoal;
      } else {
        const available = goalPool.filter((g) => !usedGoals.has(g));
        goal = (available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : goalPool[Math.floor(Math.random() * goalPool.length)])!;
      }
      usedGoals.add(goal);

      let description = concept.description;
      if (extraNotes) {
        description += `\n📌 ${extraNotes}`;
      }
      if (preferredFormat && format !== preferredFormat) {
        description += `\n💡 Sugestão: se preferires ${preferredFormat}, podemos adaptar este conceito.`;
      }

      ideas.push({
        title: concept.title,
        conceptDescription: description,
        format,
        businessGoal: goal,
      });
    }

    return { ideas };
  }
}
