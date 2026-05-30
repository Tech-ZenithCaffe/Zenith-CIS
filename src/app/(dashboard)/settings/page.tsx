"use client";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">
          Definições
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configura o teu perfil e preferências
        </p>
      </div>

      {/* Perfil */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Perfil
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Nome</label>
            <input
              type="text"
              placeholder="O teu nome"
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              disabled
              placeholder="email@exemplo.com"
              className="mt-1 block w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 shadow-sm"
            />
            <p className="mt-1 text-xs text-neutral-400">O email não pode ser alterado</p>
          </div>
        </div>
      </section>

      {/* Mercado */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Mercado
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Mercado Primário
            </label>
            <select className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="portugal">Portugal</option>
              <option value="spain">Espanha</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Role
            </label>
            <select className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="creator_portugal">Criador — Portugal</option>
              <option value="creator_spain">Criador — Espanha</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
      </section>

      {/* Preferências */}
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

      {/* Guardar */}
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Guardar Alterações
        </button>
      </div>
    </div>
  );
}
