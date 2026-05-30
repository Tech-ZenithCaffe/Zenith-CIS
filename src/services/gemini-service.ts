import {
  generateGeminiContent,
  streamGeminiContent,
} from "@/lib/gemini/client";

/**
 * Serviço de orquestração de chamadas à API Gemini.
 */
export class GeminiService {
  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    maxRetries = 2,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const text = await generateGeminiContent(systemPrompt, userPrompt);
        const cleaned = text
          .replace(/\s*/g, "")
          .trim();

        return JSON.parse(cleaned) as T;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[GeminiService] Tentativa ${attempt}/${maxRetries} falhou:`,
          error,
        );
      }
    }

    throw new Error(
      `GeminiService falhou após ${maxRetries} tentativas: ${lastError?.message}`,
    );
  }

  async *generateStream(
    systemPrompt: string,
    userPrompt: string,
  ): AsyncGenerator<string> {
    yield* streamGeminiContent(systemPrompt, userPrompt);
  }
}
