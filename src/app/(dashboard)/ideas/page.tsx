import Link from "next/link";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
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

      {/* Estado vazio */}
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
    </div>
  );
}
