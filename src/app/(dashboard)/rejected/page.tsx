"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const formatLabels: Record<string, string> = {
  stories: "Stories",
  reels: "Reels",
  carousel: "Carrossel",
};

export default function RejectedPage() {
  const [feedbackList, setFeedbackList] = useState<Array<{
    id: string;
    idea_title: string;
    rejection_reason: string;
    format: string;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/ideas/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setFeedbackList(data.feedback);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function confirmDeleteFeedback() {
    if (!confirmDelete) return;
    setDeleting(true);
    await fetch(`/api/ideas/feedback?id=${confirmDelete.id}`, { method: "DELETE" });
    setFeedbackList((prev) => prev.filter((f) => f.id !== confirmDelete.id));
    setConfirmDelete(null);
    setDeleting(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Ideias Rejeitadas
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Histórico de feedbacks que deste às ideias. Podes apagar registos individualmente.
          </p>
        </div>
        <Link
          href="/ideas"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
        >
          Voltar às Ideias
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 text-neutral-300">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.964 8.964 0 002.668-1.35m5.455 1.33A24 24 0 0018 18.5M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-neutral-700">
              Nenhuma ideia rejeitada
            </h2>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Quando rejeitares uma ideia, o feedback aparecerá aqui.
            </p>
          </div>
        ) : (
          feedbackList.map((fb) => (
            <div key={fb.id} className="flex items-start justify-between rounded-xl border border-neutral-200 bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-800">{fb.idea_title}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{fb.rejection_reason}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {fb.format && formatLabels[fb.format]} · {new Date(fb.created_at).toLocaleDateString("pt-PT")}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete({ id: fb.id, title: fb.idea_title })}
                className="ml-2 shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Apagar
              </button>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-brand-900">
              Apagar feedback
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Tens a certeza que desejas apagar o feedback de &ldquo;<span className="font-medium text-neutral-800">{confirmDelete.title}</span>&rdquo;? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteFeedback}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "A apagar..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
