"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MOODS = [
  { value: "inspirador", label: "Inspirador" },
  { value: "divertido", label: "Divertido" },
  { value: "elegante", label: "Elegante" },
  { value: "educativo", label: "Educativo" },
  { value: "autêntico", label: "Autêntico" },
  { value: "sazonal", label: "Sazonal" },
];

const GOALS = [
  { value: "followers_growth", label: "Crescimento de Seguidores" },
  { value: "engagement", label: "Engajamento" },
  { value: "organic_reach", label: "Alcance Orgânico" },
];

export default function NewIdeaPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      mood: form.get("mood") as string,
      targetAudience: form.get("targetAudience") as string,
      market: form.get("market") as string,
      format: (form.get("format") as string) || undefined,
      businessGoal: (form.get("businessGoal") as string) || undefined,
      competitorReference: (form.get("competitorReference") as string) || undefined,
      additionalNotes: (form.get("additionalNotes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? "Erro ao gerar ideias");
      }

      router.push("/ideas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/ideas"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Voltar para Ideias
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-brand-900">
          Novo Briefing
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Preenche o formulário para a IA gerar conceitos de conteúdo
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-neutral-700">
              Mood / Tom
            </label>
            <select
              id="mood"
              name="mood"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecionar...</option>
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700">
              Público-alvo
            </label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              required
              placeholder="Ex.: Jovens adultos 25-35, amantes de café especial"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="market" className="block text-sm font-medium text-neutral-700">
              Mercado
            </label>
            <select
              id="market"
              name="market"
              required
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="portugal">Portugal</option>
              <option value="spain">Espanha</option>
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium text-neutral-700">
              Formato
            </label>
            <select
              id="format"
              name="format"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Qualquer formato</option>
              <option value="stories">Stories</option>
              <option value="reels">Reels</option>
              <option value="carousel">Carrossel</option>
            </select>
          </div>

          <div>
            <label htmlFor="businessGoal" className="block text-sm font-medium text-neutral-700">
              Objetivo de Negócio
            </label>
            <select
              id="businessGoal"
              name="businessGoal"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecionar...</option>
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="competitorReference" className="block text-sm font-medium text-neutral-700">
              Referência ou Concorrente (opcional)
            </label>
            <input
              id="competitorReference"
              name="competitorReference"
              type="text"
              placeholder="@conta_instagram ou URL"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-neutral-700">
              Notas Adicionais (opcional)
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={3}
              placeholder="Qualquer informação extra relevante..."
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/ideas"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "A gerar..." : "Gerar Ideias →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
