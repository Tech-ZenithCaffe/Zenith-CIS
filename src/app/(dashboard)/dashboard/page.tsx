import Link from "next/link";

const stats = [
  { label: "Ideias Pendentes", value: "—", href: "/ideas", color: "text-brand-600" },
  { label: "Agendados Esta Semana", value: "—", href: "/calendar", color: "text-green-600" },
  { label: "Publicados Este Mês", value: "—", href: "/calendar", color: "text-blue-600" },
  { label: "Taxa de Engajamento", value: "—%", href: "#", color: "text-amber-600" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Visão geral do teu plano de conteúdo
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-sm"
          >
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
            <p className={`mt-2 font-display text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Próximos passos */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-800">
          Primeiros Passos
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="mt-3 font-medium text-brand-800">Gerar Ideias</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Cria o teu primeiro briefing e deixa a IA gerar conceitos.
            </p>
            <Link
              href="/ideas"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ir para Ideias →
            </Link>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="mt-3 font-medium text-brand-800">Agendar Conteúdo</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Planeia as datas de publicação no calendário.
            </p>
            <Link
              href="/calendar"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ir para Calendário →
            </Link>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="mt-3 font-medium text-brand-800">Configurar Conta</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Define o teu mercado e preferências.
            </p>
            <Link
              href="/settings"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ir para Definições →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
