"use client";

import { useEffect, useState } from "react";

const formatLabels: Record<string, string> = {
  stories: "Stories",
  reels: "Reels",
  carousel: "Carrossel",
};

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [market, setMarket] = useState("portugal");
  const [role, setRole] = useState("creator_portugal");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState<Array<{
    id: string;
    idea_title: string;
    rejection_reason: string;
    format: string;
    created_at: string;
  }>>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [clearing, setClearing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.profile) {
          setName(data.profile.name ?? "");
          setEmail(data.profile.email ?? "");
          setMarket(data.profile.market ?? "portugal");
          setRole(data.profile.role ?? "creator_portugal");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/ideas/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setFeedbackList(data.feedback);
        }
      })
      .catch(console.error)
      .finally(() => setFeedbackLoading(false));
  }, []);

  async function deleteFeedback(id: string) {
    await fetch(`/api/ideas/feedback?id=${id}`, { method: "DELETE" });
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
  }

  async function executeClear(action: string) {
    setClearing(action);
    try {
      await fetch("/api/settings/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (action === "feedback") setFeedbackList([]);
    } catch {
      // ignore
    } finally {
      setClearing(null);
      setConfirmAction(null);
      setConfirmText("");
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, market, role }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      } else {
        setMessage({ type: "error", text: data.message ?? "Erro ao guardar" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao guardar alterações" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">
          Definições
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configura o teu perfil e preferências
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Perfil
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Nome</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="O teu nome"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              disabled
              value={email}
              className="mt-1 block w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 shadow-sm"
            />
            <p className="mt-1 text-xs text-neutral-400">O email não pode ser alterado</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Mercado
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="market" className="block text-sm font-medium text-neutral-700">
              Mercado Primário
            </label>
            <select
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="portugal">Portugal</option>
              <option value="spain">Espanha</option>
            </select>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="creator_portugal">Criador — Portugal</option>
              <option value="creator_spain">Criador — Espanha</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Preferências
        </h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-neutral-700">
              Receber notificações de novas ideias
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-neutral-700">
              Lembretes de conteúdo por publicar
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Ideias Rejeitadas
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Histórico de feedbacks que deste às ideias. Podes apagar registos individualmente.
        </p>
        <div className="mt-4 space-y-3">
          {feedbackLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
            </div>
          ) : feedbackList.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">Nenhum feedback registado.</p>
          ) : (
            feedbackList.map((fb) => (
              <div key={fb.id} className="flex items-start justify-between rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800">{fb.idea_title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{fb.rejection_reason}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {fb.format && formatLabels[fb.format]} · {new Date(fb.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <button
                  onClick={() => deleteFeedback(fb.id)}
                  className="ml-2 shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Apagar
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-red-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-red-800">
          Gestão de Dados
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Limpa os teus dados de forma permanente. As ações com confirmação dupla pedem-te
          para escreveres &ldquo;ELIMINAR&rdquo; antes de executar.
        </p>
        <div className="mt-4 space-y-3">
          {([
            ["pending", "Apagar Ideias Pendentes"],
            ["feedback", "Apagar Feedbacks de Rejeição"],
            ["scheduled", "Apagar Conteúdo Aprovado/Agendado"],
            ["all", "Apagar Todos os Meus Dados"],
          ] as const).map(([action, label]) => (
            <div key={action} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3">
              <span className="text-sm font-medium text-neutral-700">{label}</span>
              {confirmAction === action ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder='Escreve "ELIMINAR"'
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-32 rounded border border-red-300 px-2 py-1 text-xs outline-none focus:border-red-500"
                  />
                  <button
                    onClick={() => executeClear(action)}
                    disabled={confirmText !== "ELIMINAR"}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => { setConfirmAction(null); setConfirmText(""); }}
                    className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmAction(action)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  {clearing === action ? "A apagar..." : "Apagar"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar Alterações"}
        </button>
      </div>
    </div>
  );
}
