import type { Agent, AgentExecution } from "@/types/agent";
import { GeminiService } from "@/services/gemini-service";
import type { ZodSchema } from "zod";

export abstract class BaseAgent<TInput = unknown, TOutput = unknown>
  implements Agent<TInput, TOutput>
{
  abstract readonly name: string;

  protected readonly gemini: GeminiService;
  protected readonly systemPrompt: string;

  constructor(systemPrompt: string) {
    this.gemini = new GeminiService();
    this.systemPrompt = systemPrompt;
  }

  abstract execute(_input: TInput): Promise<TOutput>;

  protected createExecution(startedAt: Date): AgentExecution {
    return {
      agentName: this.name,
      startedAt,
      success: false,
    };
  }

  protected completeExecution(
    execution: AgentExecution,
    completedAt: Date,
  ): AgentExecution {
    return {
      ...execution,
      completedAt,
      durationMs: completedAt.getTime() - execution.startedAt.getTime(),
      success: true,
    };
  }

  protected async generateValidated<T>(
    userPrompt: string,
    schema: ZodSchema<T>,
  ): Promise<T> {
    const raw = await this.gemini.generateJSON<unknown>(
      this.systemPrompt,
      userPrompt,
    );
    return schema.parse(raw);
  }
}
