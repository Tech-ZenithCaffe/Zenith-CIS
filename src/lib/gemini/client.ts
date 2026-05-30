import { GoogleGenAI } from "@google/genai";

let clientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!clientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não definida. Verifique o .env.local");
    }
    clientInstance = new GoogleGenAI({ apiKey });
  }
  return clientInstance;
}

export const GEMINI_MODEL = "gemini-2.0-flash";

export async function generateGeminiContent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  });

  // response.text é um getter (propriedade), não função
  const text = response.text as string | undefined;
  if (!text) {
    throw new Error("Gemini retornou resposta vazia");
  }
  return text;
}

export async function* streamGeminiContent(
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string> {
  const client = getGeminiClient();
  const stream = await client.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  for await (const chunk of stream) {
    // chunk.text é um getter (propriedade), não função
    const text = chunk.text as string | undefined;
    if (text) {
      yield text;
    }
  }
}
