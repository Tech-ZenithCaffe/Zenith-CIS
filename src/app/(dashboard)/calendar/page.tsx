export default function CalendarPage() {
  const daysOfWeek = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  // Maio 2026 — começa numa sexta-feira
  const startDay = 4; // 0=Dom, 1=Seg, ..., 4=Sex
  const daysInMonth = 31;
  const today = 29;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Calendário
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Maio 2026 — Planeia e visualiza o teu conteúdo agendado
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
            ← Mês
          </button>
          <button className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50">
            Mês →
          </button>
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              className={`min-h-[100px] border-b border-r border-neutral-100 p-2 ${
                day === today ? "bg-brand-50" : ""
              }`}
            >
              {day && (
                <>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      day === today
                        ? "bg-brand-600 text-white"
                        : "text-neutral-600"
                    }`}
                  >
                    {day}
                  </span>
                  {/* Placeholder para conteúdo agendado */}
                  <div className="mt-1 space-y-1">
                    <div className="h-2 rounded bg-neutral-100" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-brand-50 border border-brand-200" />
          Hoje
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-100 border border-amber-200" />
          Conteúdo agendado
        </div>
      </div>
    </div>
  );
}
