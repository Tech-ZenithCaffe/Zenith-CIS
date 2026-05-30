export interface Agent<TInput = unknown, TOutput = unknown> {
  readonly name: string;
  execute(_input: TInput): Promise<TOutput>;
}

export interface AgentExecution {
  agentName: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  success: boolean;
  error?: string;
}

export interface AgentPipeline {
  agents: Array<{
    agent: Agent;
    input: unknown;
  }>;
  onStepComplete?: (_execution: AgentExecution) => void;
}
