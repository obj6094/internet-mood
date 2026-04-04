"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const MOODS = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Tired",
  "Excited",
  "Numb",
  "Calm",
] as const;

type Mood = (typeof MOODS)[number];

const MOOD_META: Record<Mood, { emoji: string; btn: string; bar: string }> = {
  Happy: {
    emoji: "😊",
    btn: "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100",
    bar: "bg-amber-500",
  },
  Sad: {
    emoji: "😢",
    btn: "border-sky-300 bg-sky-50 text-sky-950 hover:bg-sky-100",
    bar: "bg-sky-500",
  },
  Angry: {
    emoji: "😤",
    btn: "border-rose-300 bg-rose-50 text-rose-950 hover:bg-rose-100",
    bar: "bg-rose-500",
  },
  Anxious: {
    emoji: "😰",
    btn: "border-violet-300 bg-violet-50 text-violet-950 hover:bg-violet-100",
    bar: "bg-violet-500",
  },
  Tired: {
    emoji: "😴",
    btn: "border-indigo-300 bg-indigo-50 text-indigo-950 hover:bg-indigo-100",
    bar: "bg-indigo-500",
  },
  Excited: {
    emoji: "🤩",
    btn: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-950 hover:bg-fuchsia-100",
    bar: "bg-fuchsia-500",
  },
  Numb: {
    emoji: "😶",
    btn: "border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    bar: "bg-zinc-500",
  },
  Calm: {
    emoji: "😌",
    btn: "border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
    bar: "bg-emerald-500",
  },
};

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** e.g. 2026-04-03 → "April 3, 2026" */
function formatDateSpoken(isoDate: string): string {
  const [y, mo, d] = isoDate.slice(0, 10).split("-").map(Number);
  if (!y || !mo || !d) return isoDate;
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type ArchiveRow = {
  vote_date: string;
  mood: string;
  votes: number;
};

export default function Home() {
  const today = useMemo(() => formatLocalDate(new Date()), []);

  const [todayCounts, setTodayCounts] = useState<Record<string, number>>({});
  const [archiveByDate, setArchiveByDate] = useState<
    Map<string, ArchiveRow[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const loadData = useCallback(async () => {
    const votesRes = await supabase
      .from("mood_votes")
      .select("mood")
      .eq("vote_date", today);

    if (votesRes.error) {
      setError(votesRes.error.message);
      setLoading(false);
      return;
    }

    const counts: Record<string, number> = {};
    for (const m of MOODS) counts[m] = 0;
    for (const row of votesRes.data ?? []) {
      const m = row.mood as string;
      counts[m] = (counts[m] ?? 0) + 1;
    }

    const archRes = await supabase
      .from("daily_mood_archive")
      .select("vote_date, mood, votes")
      .order("vote_date", { ascending: false });

    if (archRes.error) {
      setError(archRes.error.message);
      setLoading(false);
      return;
    }

    const map = new Map<string, ArchiveRow[]>();
    for (const row of archRes.data ?? []) {
      const d = String(row.vote_date).slice(0, 10);
      const list = map.get(d) ?? [];
      list.push({
        vote_date: d,
        mood: row.mood,
        votes: row.votes,
      });
      map.set(d, list);
    }

    setError(null);
    setTodayCounts(counts);
    setArchiveByDate(map);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  const totalToday = useMemo(
    () => Object.values(todayCounts).reduce((a, b) => a + b, 0),
    [todayCounts],
  );

  async function onVote(mood: Mood) {
    setVoting(true);
    setError(null);
    const { error: insErr } = await supabase.from("mood_votes").insert({
      mood,
      vote_date: today,
    });
    setVoting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    await loadData();
  }

  const archiveDates = useMemo(() => {
    return [...archiveByDate.keys()]
      .filter((d) => d !== today)
      .sort()
      .reverse();
  }, [archiveByDate, today]);

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-10 px-4 py-12 pb-16 text-stone-900">
      <header>
        <h1 className="text-balance text-[1.65rem] font-medium leading-snug tracking-tight text-stone-800 sm:text-3xl">
          How is the internet feeling today?
        </h1>
      </header>

      <section aria-label="Mood votes">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              disabled={voting || loading}
              onClick={() => onVote(m)}
              className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-2.5 text-center text-sm font-medium transition-colors disabled:opacity-50 ${MOOD_META[m].btn}`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {MOOD_META[m].emoji}
              </span>
              <span className="leading-tight">{m}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-stone-200/90 pt-10">
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Today
        </h2>
        {loading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : (
          <ul className="space-y-3.5">
            {MOODS.map((m) => {
              const c = todayCounts[m] ?? 0;
              const pct =
                totalToday > 0
                  ? Math.round((c / totalToday) * 1000) / 10
                  : 0;
              const width =
                totalToday > 0 ? Math.max(2, (c / totalToday) * 100) : 0;
              return (
                <li key={m}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-stone-800">{m}</span>
                    <span className="shrink-0 tabular-nums text-stone-500">
                      <span className="font-medium text-stone-800">{c}</span>
                      {totalToday > 0 ? (
                        <span className="text-stone-400"> · {pct}%</span>
                      ) : (
                        <span className="text-stone-400"> · —</span>
                      )}
                    </span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-stone-200/90">
                    <div
                      className={`h-full rounded-full ${MOOD_META[m].bar}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-5 border-t border-stone-200/90 pt-10">
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Earlier
        </h2>
        {archiveDates.length === 0 ? (
          <p className="text-sm leading-relaxed text-stone-500">
            No earlier days yet.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200/90">
            {archiveDates.map((date) => {
              const rows = archiveByDate.get(date) ?? [];
              const sorted = [...rows].sort((a, b) => b.votes - a.votes);
              const winner = sorted[0];
              const spoken = formatDateSpoken(date);
              return (
                <li key={date} className="py-5 first:pt-0 last:pb-0">
                  {winner && winner.votes > 0 ? (
                    <p className="text-[0.9375rem] leading-relaxed text-stone-700">
                      On{" "}
                      <time dateTime={date} className="text-stone-900">
                        {spoken}
                      </time>
                      , the internet felt{" "}
                      <span className="font-medium text-stone-900">
                        {winner.mood}
                      </span>
                      .
                    </p>
                  ) : (
                    <p className="text-[0.9375rem] leading-relaxed text-stone-500">
                      <time dateTime={date} className="text-stone-700">
                        {spoken}
                      </time>
                      {" "}
                      — no votes recorded.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
