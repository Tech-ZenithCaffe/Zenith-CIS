"use client";

import { useEffect, useState, useCallback } from "react";

interface CalendarPackage {
  id: string;
  idea_title: string;
  idea_description: string;
  format: string;
  business_goal: string;
  scheduled_date: string | null;
  created_at: string;
  is_saved: boolean;
}

const formatLabels: Record<string, string> = {
  stories: "Stories",
  reels: "Reels",
  carousel: "Carrossel",
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function getToday() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

function dateStr(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function DayModal({
  year,
  month,
  day,
  packages,
  onClose,
  onSchedule,
  onUnschedule,
}: {
  year: number;
  month: number;
  day: number;
  packages: CalendarPackage[];
  onClose: () => void;
  onSchedule: (pkgId: string, date: string) => void;
  onUnschedule: (pkgId: string) => void;
}) {
  const dayStr = dateStr(year, month, day);
  const isFuture = new Date(dayStr) >= new Date(getToday().year, getToday().month - 1, getToday().day);

  const scheduled = packages.filter((p) => p.scheduled_date?.startsWith(dayStr));
  const unscheduled = packages.filter((p) => !p.scheduled_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-brand-900">
            {day} de {MONTHS[month - 1]} {year}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>

        {scheduled.length > 0 && (
          <section className="mt-4">
            <h4 className="text-sm font-semibold text-neutral-600">Agendado</h4>
            <div className="mt-2 space-y-2">
              {scheduled.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-amber-900">{pkg.idea_title}</p>
                    <span className="text-xs text-amber-700">{formatLabels[pkg.format] ?? pkg.format}</span>
                  </div>
                  <button
                    onClick={() => onUnschedule(pkg.id)}
                    className="ml-2 shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {unscheduled.length > 0 && isFuture && (
          <section className="mt-4">
            <h4 className="text-sm font-semibold text-neutral-600">Conteúdo Disponível</h4>
            <div className="mt-2 space-y-2">
              {unscheduled.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">{pkg.idea_title}</p>
                    <span className="text-xs text-neutral-500">{formatLabels[pkg.format] ?? pkg.format}</span>
                  </div>
                  <button
                    onClick={() => onSchedule(pkg.id, dayStr)}
                    className="ml-2 shrink-0 rounded bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    Agendar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {scheduled.length === 0 && unscheduled.length === 0 && (
          <p className="mt-4 text-sm text-neutral-400">Nenhum conteúdo disponível para este dia.</p>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = getToday();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [packages, setPackages] = useState<CalendarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ day: number } | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
      const data = await res.json();
      if (data.status === "success") {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  async function handleSchedule(pkgId: string, date: string) {
    await fetch("/api/calendar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_id: pkgId, scheduled_date: date }),
    });
    fetchPackages();
  }

  async function handleUnschedule(pkgId: string) {
    await fetch("/api/calendar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_id: pkgId, scheduled_date: null }),
    });
    fetchPackages();
  }

  const days = buildCalendarGrid(year, month);
  const isCurrentMonth = year === today.year && month === today.month;

  function packagesForDay(day: number) {
    const dayStr = dateStr(year, month, day);
    return packages.filter((p) => {
      if (p.scheduled_date) return p.scheduled_date.startsWith(dayStr);
      return p.created_at.startsWith(dayStr);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">Calendário</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {MONTHS[month - 1]} {year} — Clica num dia para agendar conteúdo
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (month === 1) { setYear((y) => y - 1); setMonth(12); }
              else { setMonth((m) => m - 1); }
            }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            ← {MONTHS[month === 1 ? 11 : month - 2]}
          </button>
          <button
            onClick={() => {
              if (month === 12) { setYear((y) => y + 1); setMonth(1); }
              else { setMonth((m) => m + 1); }
            }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            {MONTHS[month === 12 ? 0 : month]} →
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-7 border-b border-neutral-100">
          {DAYS.map((day) => (
            <div key={day} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayPkgs = day ? packagesForDay(day) : [];
            const isToday = isCurrentMonth && day === today.day;
            const dayOfWeek = idx % 7;

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDay({ day })}
                className={`min-h-[110px] cursor-pointer border-b border-r border-neutral-100 p-2 transition-colors hover:bg-brand-50/50 ${
                  isToday ? "bg-brand-50" : dayOfWeek === 0 || dayOfWeek === 6 ? "bg-neutral-50/50" : ""
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday ? "bg-brand-600 text-white" : "text-neutral-600"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayPkgs.slice(0, 3).map((pkg) => (
                        <div
                          key={pkg.id}
                          className="truncate rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800"
                          title={pkg.idea_title}
                        >
                          {formatLabels[pkg.format] ?? pkg.format} — {pkg.idea_title}
                        </div>
                      ))}
                      {dayPkgs.length > 3 && (
                        <div className="text-[11px] text-neutral-400">+{dayPkgs.length - 3} mais</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-brand-50 border border-brand-200" /> Hoje
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-amber-50 border border-amber-200" /> Conteúdo
        </div>
        {packages.length === 0 && !loading && (
          <span className="text-neutral-400">Nenhum conteúdo este mês</span>
        )}
      </div>

      {selectedDay && (
        <DayModal
          year={year}
          month={month}
          day={selectedDay.day}
          packages={packages}
          onClose={() => setSelectedDay(null)}
          onSchedule={handleSchedule}
          onUnschedule={handleUnschedule}
        />
      )}
    </div>
  );
}
