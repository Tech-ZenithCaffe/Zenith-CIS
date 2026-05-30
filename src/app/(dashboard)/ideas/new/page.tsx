"use client";

import Link from "next/link";

export default function NewIdeaPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Cabeçalho */}
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

      {/* Formulário placeholder */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Mood / Tom
            </label>
            <select className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Selecionar...</option>
              <option value="inspirador">Inspirador</option>
              <option value="divertido">Divertido</option>
              <option value="elegante">Elegante</option>
              <option value="educativo">Educativo</option>
              <option value="autêntico">Autêntico</option>
              <option value="sazonal">Sazonal</option>
            </select>
          </div>

          {/* Público-alvo */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Público-alvo
            </label>
            <input
              type="text"
              placeholder="Ex.: Jovens adultos 25-35, amantes de café especial"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Mercado */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Mercado
            </label>
            <select className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="portugal">Portugal</option>
              <option value="spain">Espanha</option>
            </select>
          </div>

          {/* Formato */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Formato
            </label>
            <select className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Qualquer formato</option>
              <option value="stories">Stories</option>
              <option value="reels">Reels</option>
              <option value="carousel">Carrossel</option>
            </select>
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Objetivo de Negócio
            </label>
            <select className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">Selecionar...</option>
              <option value="followers_growth">Crescimento de Seguidores</option>
              <option value="engagement">Engajamento</option>
              <option value="organic_reach">Alcance Orgânico</option>
            </select>
          </div>

          {/* Referência */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Referência ou Concorrente (opcional)
            </label>
            <input
              type="text"
              placeholder="@conta_instagram ou URL"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Notas Adicionais (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Qualquer informação extra relevante..."
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Botão */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/ideas"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Gerar Ideias →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
