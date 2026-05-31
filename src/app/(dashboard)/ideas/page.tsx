"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { ContentIdea } from "@/types/content";

const formatLabels: Record<string, string> = {
  stories: "Stories",
  reels: "Reels",
  carousel: "Carrossel",
};

const goalLabels: Record<string, string> = {
  followers_growth: "Crescimento",
  engagement: "Engajamento",
  organic_reach: "Alcance Orgânico",
};

type ApproveStep = "copywriting" | "prompting" | "growth" | "complete" | "error";

interface ApproveState {
  currentStep: ApproveStep;
  doneSteps: Set<string>;
  data?: Record<string, unknown>;
}

interface IdeaCardProps {
  idea: ContentIdea;
  onApprove: (_ideaId: string) => Promise<void>;
  onReject: (_ideaId: string) => void;
  approving: boolean;
}

function IdeaCard({ idea, onApprove, onReject, approving }: IdeaCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm ${
        approving ? "border-brand-300" : "border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-brand-900">
            {idea.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
            {idea.conceptDescription}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {formatLabels[idea.format] ?? idea.format}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
            {goalLabels[idea.businessGoal] ?? idea.businessGoal}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {new Date(idea.created_at).toLocaleDateString("pt-PT")}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onReject(idea.id)}
            disabled={approving}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rejeitar
          </button>
          <button
            onClick={() => onApprove(idea.id)}
            disabled={approving}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {approving ? "A processar..." : "Aprovar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  ideaId,
  onClose,
  onConfirm,
}: {
  ideaId: string;
  onClose: () => void;
  onConfirm: (_ideaId: string, _reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-lg font-bold text-brand-900">
          Rejeitar Ideia
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Explica porque rejeitaste esta ideia — o teu feedback vai ajudar a IA
          a gerar ideias melhores no futuro.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: O formato carrossel não funciona para este público..."
          rows={4}
          className="mt-4 w-full resize-none rounded-lg border border-neutral-300 p-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) return;
              setSubmitting(true);
              onConfirm(ideaId, reason.trim()).finally(() => setSubmitting(false));
            }}
            disabled={submitting || !reason.trim()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "A rejeitar..." : "Rejeitar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-400">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-neutral-700">
        Nenhuma ideia ainda
      </h2>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        Cria o teu primeiro briefing — a IA gera 3 conceitos para escolheres.
      </p>
      <Link
        href="/ideas/new"
        className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Criar Primeira Ideia
      </Link>
    </div>
  );
}

function ApproveProgress({ state }: { state: ApproveState }) {
  const steps = [
    { key: "copywriting", label: "Copywriting" },
    { key: "prompting", label: "Prompts Visuais" },
    { key: "growth", label: "Growth Tips" },
  ] as const;

  const isComplete = state.currentStep === "complete";
  const isError = state.currentStep === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="font-display text-lg font-bold text-brand-900">
          {isComplete
            ? "Pacote gerado com sucesso!"
            : isError
              ? "Erro ao gerar pacote"
              : "A gerar pacote de conteúdo..."}
        </h3>
        <div className="mt-4 space-y-3">
          {steps.map((step) => {
            const done = state.doneSteps.has(step.key);
            const active = state.currentStep === step.key;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-green-100 text-green-600"
                      : active
                        ? "bg-brand-100 text-brand-600"
                        : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {done ? "✓" : active ? "..." : step.key.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`text-sm ${
                    done
                      ? "font-medium text-green-700"
                      : active
                        ? "font-medium text-brand-700"
                        : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        {isComplete && (
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Voltar às Ideias
          </button>
        )}
        {isError && (
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveState, setApproveState] = useState<ApproveState | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setIdeas(data.ideas);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReject = useCallback((ideaId: string) => {
    setRejectingId(ideaId);
  }, []);

  const confirmReject = useCallback(async (ideaId: string, reason: string) => {
    const res = await fetch("/api/ideas/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_id: ideaId, reason }),
    });
    if (res.ok) {
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    }
    setRejectingId(null);
  }, []);

  const handleApprove = useCallback(async (ideaId: string) => {
    setApprovingId(ideaId);
    setApproveState({ currentStep: "copywriting", doneSteps: new Set() });

    try {
      const res = await fetch("/api/ideas/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_id: ideaId }),
      });

      if (!res.ok) {
        await res.json();
        setApproveState({ currentStep: "error", doneSteps: new Set() });
        setApprovingId(null);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
            continue;
          }

          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (currentEvent === "progress" && data.step) {
              setApproveState((prev) => {
                if (!prev) return prev;
                const doneSteps = new Set(prev.doneSteps);
                doneSteps.add(data.step);
                return { currentStep: data.step, doneSteps, data };
              });
            }

            if (currentEvent === "complete") {
              setApproveState((prev) => {
                if (!prev) return prev;
                const doneSteps = new Set(prev.doneSteps);
                doneSteps.add("complete");
                return { currentStep: "complete", doneSteps, data };
              });
              setApprovingId(null);
            }

            if (currentEvent === "error") {
              setApproveState({ currentStep: "error", doneSteps: new Set() });
              setApprovingId(null);
            }
          }
        }
      }
    } catch {
      setApproveState({ currentStep: "error", doneSteps: new Set() });
      setApprovingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Ideias
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gere e aprova conceitos de conteúdo para o teu mercado
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          + Nova Ideia
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
        </div>
      ) : ideas.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onApprove={handleApprove}
              onReject={handleReject}
              approving={approvingId === idea.id}
            />
          ))}
        </div>
      )}

      {approveState && (
        <ApproveProgress state={approveState} />
      )}

      {rejectingId && (
        <RejectModal
          ideaId={rejectingId}
          onClose={() => setRejectingId(null)}
          onConfirm={confirmReject}
        />
      )}
    </div>
  );
}
