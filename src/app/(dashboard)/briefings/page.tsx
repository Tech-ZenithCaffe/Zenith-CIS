"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

type Briefing = {
  id: string;
  title: string;
  content: string | null;
  type: "text" | "file" | "link";
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

const FILE_TYPE_LABELS: Record<string, string> = {
  "image/jpeg": "Imagem",
  "image/png": "Imagem",
  "image/webp": "Imagem",
  "image/gif": "Imagem",
  "application/pdf": "PDF",
  "video/mp4": "Vídeo",
  "video/quicktime": "Vídeo",
  "text/plain": "Texto",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string | null) {
  const isImage = type?.startsWith("image/");
  const isVideo = type?.startsWith("video/");
  const isPdf = type === "application/pdf";
  if (isImage) return "🖼️";
  if (isVideo) return "🎬";
  if (isPdf) return "📄";
  return "📎";
}

export default function BriefingsPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"text" | "file" | "link">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/briefings")
      .then((r) => r.json())
      .then((d) => { if (d.status === "success") setBriefings(d.briefings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.set("title", title.trim());
      fd.set("type", type);
      if (type === "text") fd.set("content", content);
      if (type === "file" && file) fd.set("file", file);

      const res = await fetch("/api/briefings", { method: "POST", body: fd });
      const data = await res.json();

      if (data.status === "success") {
        setBriefings((prev) => [data.briefing, ...prev]);
        setTitle("");
        setContent("");
        setFile(null);
        setShowForm(false);
      } else {
        alert(data.message ?? "Erro ao guardar");
      }
    } catch {
      alert("Erro ao guardar briefing");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tens a certeza que queres remover este briefing?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/briefings?id=${id}`, { method: "DELETE" });
      setBriefings((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Erro ao remover");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Briefings
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Informações sobre o teu negócio para contextualizar a IA
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          {showForm ? "Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              {(["text", "file", "link"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); setFile(null); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    type === t
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {t === "text" ? "📝 Texto" : t === "file" ? "📎 Ficheiro" : "🔗 Link"}
                </button>
              ))}
            </div>

            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "link" ? "Ex.: Link do Instagram da concorrência" : "Título do briefing"}
                className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            {type === "text" && (
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Descreve informações sobre o teu negócio: valores, tom de voz, produtos, público-alvo, concorrência..."
                  className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}

            {type === "file" && (
              <div>
                <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500 transition-colors hover:border-brand-400 hover:text-brand-600">
                  {file ? (
                    <span className="font-medium text-neutral-700">{file.name}</span>
                  ) : (
                    <span>Clique para selecionar ficheiro (imagem, PDF, vídeo, documento)</span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}

            {type === "link" && (
              <p className="text-xs text-neutral-400">
                Cola o título com o URL do link como conteúdo adicional.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
        </div>
      ) : briefings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl text-brand-400">
            📋
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-neutral-700">
            Nenhum briefing ainda
          </h2>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">
            Adiciona informações sobre o teu negócio — a IA vai usá-las para gerar ideias mais relevantes.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Adicionar Briefing
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {briefings.map((b) => (
            <div
              key={b.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {b.type === "text" ? "📝" : b.type === "file" ? getFileIcon(b.file_type) : "🔗"}
                  </span>
                  <h3 className="truncate text-sm font-semibold text-neutral-900">
                    {b.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    {b.type === "text" ? "Texto" : b.type === "file" ? FILE_TYPE_LABELS[b.file_type ?? ""] ?? "Ficheiro" : "Link"}
                  </span>
                  {b.file_size && (
                    <span className="shrink-0 text-[10px] text-neutral-400">
                      {formatFileSize(b.file_size)}
                    </span>
                  )}
                </div>
                {b.content && (
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-neutral-600">
                    {b.content}
                  </p>
                )}
                {b.file_url && (
                  <div className="mt-2">
                    {b.file_type?.startsWith("image/") ? (
                      <Image
                        src={b.file_url ?? ""}
                        alt={b.title}
                        width={400}
                        height={300}
                        className="max-h-40 rounded-lg border border-neutral-200 object-cover"
                        unoptimized
                      />
                    ) : (
                      <a
                        href={b.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Abrir ficheiro ↗
                      </a>
                    )}
                  </div>
                )}
                <p className="mt-1 text-[10px] text-neutral-400">
                  {new Date(b.created_at).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                disabled={deletingId === b.id}
                className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                title="Remover"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
