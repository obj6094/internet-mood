"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoodGlobe } from "@/components/MoodGlobe";
import {
  leadingCommentaryLine,
  neutralHeroLine,
} from "@/lib/moodCommentary";
import type { Mood } from "@/lib/moods";
import { MOODS } from "@/lib/moods";
import { supabase } from "@/lib/supabase";

/** Hue + tokens for atmosphere, tiles, signal strip, spotlight */
const MOOD_META: Record<
  Mood,
  {
    glow: string;
    tile: string;
    strip: string;
    bar: string;
    spotlight: string;
  }
> = {
  Happy: {
    glow: "38 92% 54%",
    tile:
      "border-amber-200/90 bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-950 shadow-amber-900/5 hover:border-amber-300 hover:shadow-md hover:shadow-amber-900/10",
    strip: "bg-amber-400",
    bar: "bg-amber-500",
    spotlight:
      "from-amber-50 to-amber-100/90 border-amber-200/80 ring-amber-400/25",
  },
  Sad: {
    glow: "210 70% 52%",
    tile:
      "border-sky-200/90 bg-gradient-to-br from-sky-50 to-sky-100/80 text-sky-950 shadow-sky-900/5 hover:border-sky-300 hover:shadow-md hover:shadow-sky-900/10",
    strip: "bg-sky-400",
    bar: "bg-sky-500",
    spotlight:
      "from-sky-50 to-sky-100/90 border-sky-200/80 ring-sky-400/25",
  },
  Angry: {
    glow: "350 80% 58%",
    tile:
      "border-rose-200/90 bg-gradient-to-br from-rose-50 to-rose-100/80 text-rose-950 shadow-rose-900/5 hover:border-rose-300 hover:shadow-md hover:shadow-rose-900/10",
    strip: "bg-rose-400",
    bar: "bg-rose-500",
    spotlight:
      "from-rose-50 to-rose-100/90 border-rose-200/80 ring-rose-400/25",
  },
  Anxious: {
    glow: "265 75% 58%",
    tile:
      "border-violet-200/90 bg-gradient-to-br from-violet-50 to-violet-100/80 text-violet-950 shadow-violet-900/5 hover:border-violet-300 hover:shadow-md hover:shadow-violet-900/10",
    strip: "bg-violet-400",
    bar: "bg-violet-500",
    spotlight:
      "from-violet-50 to-violet-100/90 border-violet-200/80 ring-violet-400/25",
  },
  Tired: {
    glow: "245 55% 52%",
    tile:
      "border-indigo-200/90 bg-gradient-to-br from-indigo-50 to-indigo-100/80 text-indigo-950 shadow-indigo-900/5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-900/10",
    strip: "bg-indigo-400",
    bar: "bg-indigo-500",
    spotlight:
      "from-indigo-50 to-indigo-100/90 border-indigo-200/80 ring-indigo-400/25",
  },
  Excited: {
    glow: "310 85% 58%",
    tile:
      "border-fuchsia-200/90 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/80 text-fuchsia-950 shadow-fuchsia-900/5 hover:border-fuchsia-300 hover:shadow-md hover:shadow-fuchsia-900/10",
    strip: "bg-fuchsia-400",
    bar: "bg-fuchsia-500",
    spotlight:
      "from-fuchsia-50 to-fuchsia-100/90 border-fuchsia-200/80 ring-fuchsia-400/25",
  },
  Numb: {
    glow: "220 12% 58%",
    tile:
      "border-zinc-300/90 bg-gradient-to-br from-zinc-100 to-zinc-200/70 text-zinc-900 shadow-zinc-900/5 hover:border-zinc-400 hover:shadow-md hover:shadow-zinc-900/10",
    strip: "bg-zinc-400",
    bar: "bg-zinc-500",
    spotlight:
      "from-zinc-100 to-zinc-200/90 border-zinc-300/80 ring-zinc-400/20",
  },
  Calm: {
    glow: "155 55% 42%",
    tile:
      "border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-950 shadow-emerald-900/5 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-900/10",
    strip: "bg-emerald-400",
    bar: "bg-emerald-500",
    spotlight:
      "from-emerald-50 to-emerald-100/90 border-emerald-200/80 ring-emerald-400/25",
  },
};

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

function formatTodayLabel(iso: string): string {
  const [y, mo, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !mo || !d) return iso;
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function leadingMoodFor(
  counts: Record<string, number>,
  total: number,
): Mood | null {
  if (total <= 0) return null;
  let best: Mood | null = null;
  let bestCount = -1;
  for (const m of MOODS) {
    const c = counts[m] ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = m;
    }
  }
  return best;
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
  const [lastVote, setLastVote] = useState<Mood | null>(null);

  const emptyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of MOODS) counts[m] = 0;
    return counts;
  }, []);

  /** Loads real counts from Supabase — RPC first (bypasses broken RLS on aggregates), then raw rows. */
  const loadTodayCounts = useCallback(async () => {
    const rpc = await supabase.rpc("get_mood_vote_counts_for_day", {
      p_vote_date: today,
    });

    if (!rpc.error && Array.isArray(rpc.data)) {
      const counts: Record<string, number> = { ...emptyCounts };
      for (const row of rpc.data as { mood: string; vote_count: number | string }[]) {
        const m = row.mood as string;
        counts[m] = Number(row.vote_count);
      }
      return { error: null, counts };
    }

    const res = await supabase
      .from("mood_votes")
      .select("mood")
      .eq("vote_date", today);

    if (res.error) {
      const rpcHint = rpc.error?.message
        ? ` (${rpc.error.message})`
        : "";
      return { error: res.error.message + rpcHint, counts: null };
    }

    const counts: Record<string, number> = { ...emptyCounts };
    for (const row of res.data ?? []) {
      const m = row.mood as string;
      counts[m] = (counts[m] ?? 0) + 1;
    }
    return { error: null, counts };
  }, [today, emptyCounts]);

  const loadArchive = useCallback(async () => {
    const archRes = await supabase
      .from("daily_mood_archive")
      .select("vote_date, mood, votes")
      .order("vote_date", { ascending: false });

    if (archRes.error) return { error: archRes.error.message, map: null };

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
    return { error: null, map };
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    const [todayRes, archRes] = await Promise.all([
      loadTodayCounts(),
      loadArchive(),
    ]);

    if (todayRes.error) {
      setError(todayRes.error);
      setLoading(false);
      return;
    }
    if (archRes.error) {
      setError(archRes.error);
      setLoading(false);
      return;
    }

    setError(null);
    setTodayCounts(todayRes.counts!);
    setArchiveByDate(archRes.map!);
    setLoading(false);
  }, [loadTodayCounts, loadArchive]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadInitial();
    }, 0);
    return () => clearTimeout(t);
  }, [loadInitial]);

  const totalToday = useMemo(
    () => Object.values(todayCounts).reduce((a, b) => a + b, 0),
    [todayCounts],
  );

  const leader = useMemo(
    () => leadingMoodFor(todayCounts, totalToday),
    [todayCounts, totalToday],
  );

  const sortedForStrip = useMemo(() => {
    return [...MOODS].sort((a, b) => {
      const ca = todayCounts[a] ?? 0;
      const cb = todayCounts[b] ?? 0;
      if (cb !== ca) return cb - ca;
      return MOODS.indexOf(a) - MOODS.indexOf(b);
    });
  }, [todayCounts]);

  const heroGlobeMood = useMemo(() => {
    if (loading) return "neutral" as const;
    if (totalToday === 0) return "neutral" as const;
    return leader ?? ("neutral" as const);
  }, [loading, totalToday, leader]);

  const heroCommentary = useMemo(() => {
    if (loading) return "";
    if (totalToday === 0) return neutralHeroLine(today);
    if (leader) return leadingCommentaryLine(leader, today);
    return "";
  }, [loading, totalToday, leader, today]);

  async function onVote(mood: Mood) {
    if (loading) return;
    setError(null);
    setLastVote(mood);

    setTodayCounts((prev) => ({
      ...prev,
      [mood]: (prev[mood] ?? 0) + 1,
    }));

    const { error: insErr } = await supabase.from("mood_votes").insert({
      mood,
      vote_date: today,
    });

    if (insErr) {
      setError(insErr.message);
      setLastVote(null);
      setTodayCounts((prev) => ({
        ...prev,
        [mood]: Math.max(0, (prev[mood] ?? 0) - 1),
      }));
      return;
    }

    const reload = await loadTodayCounts();
    if (reload.counts) {
      setTodayCounts(reload.counts);
      setError(null);
    } else if (reload.error) {
      setError(
        `${reload.error} — your vote may still be saved; try refreshing.`,
      );
    }
  }

  const archiveDates = useMemo(() => {
    return [...archiveByDate.keys()]
      .filter((d) => d !== today)
      .sort()
      .reverse();
  }, [archiveByDate, today]);

  const shellStyle = useMemo(() => {
    const g = leader ? MOOD_META[leader].glow : "32 18% 72%";
    return {
      "--atmosphere-glow": g,
    } as React.CSSProperties;
  }, [leader]);

  return (
    <div
      className="page-shell relative z-10 min-h-full"
      style={shellStyle}
    >
      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-10 px-4 py-10 pb-20 sm:gap-12 sm:py-14">
        {/* Hero — globe centerpiece */}
        <header className="space-y-6">
          <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500 sm:text-left sm:text-xs">
            Internet mood ·{" "}
            <time dateTime={today}>{formatTodayLabel(today)}</time>
          </p>

          <div className="flex flex-col items-center gap-5 sm:gap-6">
            {loading ? (
              <div
                className="loading-shimmer flex aspect-square w-[min(88vw,280px)] max-w-[280px] items-center justify-center rounded-full bg-stone-300/40 ring-1 ring-stone-400/20"
                aria-hidden
              />
            ) : (
              <div className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out">
                <MoodGlobe mood={heroGlobeMood} size="hero" />
              </div>
            )}

            {loading ? (
              <div className="w-full space-y-4">
                <div className="loading-shimmer mx-auto h-9 max-w-[18rem] rounded-md bg-stone-300/50 sm:h-11" />
                <div className="loading-shimmer mx-auto h-4 max-w-[20rem] rounded-md bg-stone-300/40" />
              </div>
            ) : totalToday === 0 ? (
              <div className="w-full max-w-xl space-y-3 text-center sm:text-left">
                <h1 className="text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-stone-900 sm:text-[2.05rem]">
                  Today&apos;s collective mood is still{" "}
                  <span className="text-stone-600">unwritten</span>.
                </h1>
                <p className="text-pretty text-base leading-relaxed text-stone-600 sm:text-[1.05rem]">
                  {heroCommentary}
                </p>
                <p className="text-pretty text-sm leading-relaxed text-stone-500">
                  Tap a mood below — your vote becomes part of the live
                  snapshot.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-xl space-y-3 text-center sm:text-left">
                <p className="text-sm font-medium text-stone-500 sm:text-base">
                  Right now, the internet reads mostly
                </p>
                <h1 className="text-balance bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 bg-clip-text text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-transparent sm:text-[2.35rem]">
                  {leader ?? "—"}
                </h1>
                <p className="max-w-[34rem] text-pretty text-base leading-relaxed text-stone-700 sm:text-[1.05rem]">
                  {heroCommentary}
                </p>
                {leader ? (
                  <p className="font-mono text-sm tabular-nums text-stone-600 sm:text-base">
                    <span className="font-semibold text-stone-800">
                      {Math.round(
                        ((todayCounts[leader] ?? 0) / totalToday) * 1000,
                      ) / 10}
                      %
                    </span>
                    <span className="text-stone-400"> · </span>
                    <span>{totalToday} votes today</span>
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Signal strip */}
          <div
            className="pt-1"
            role="img"
            aria-label={
              loading
                ? "Loading mood distribution"
                : totalToday === 0
                  ? "No votes yet; waiting for first signals"
                  : `Mood distribution across ${totalToday} votes`
            }
          >
            <div className="flex h-3 overflow-hidden rounded-full bg-stone-300/40 ring-1 ring-stone-400/15 sm:h-3.5">
              {loading ? (
                <div className="loading-shimmer h-full w-full bg-stone-300/60" />
              ) : totalToday === 0 ? (
                MOODS.map((m) => (
                  <div
                    key={m}
                    className={`min-w-px flex-1 ${MOOD_META[m].strip} opacity-[0.18]`}
                  />
                ))
              ) : (
                sortedForStrip.map((m) => {
                  const c = todayCounts[m] ?? 0;
                  const flex = Math.max(c, 0);
                  return (
                    <div
                      key={m}
                      className={`min-w-0 ${MOOD_META[m].strip} motion-safe:transition-[flex-grow] motion-safe:duration-500 motion-safe:ease-out`}
                      style={{
                        flex: flex,
                      }}
                      title={`${m}: ${c}`}
                    />
                  );
                })
              )}
            </div>
            <p className="mt-2 text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] text-stone-400 sm:text-left">
              Live mix · today
            </p>
          </div>
        </header>

        {/* Vote — globe mood tiles */}
        <section aria-label="Cast your mood vote" className="space-y-3">
          <h2 className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:text-left">
            Add your signal
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3">
            {MOODS.map((m) => {
              const isLast = lastVote === m;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={loading}
                  onClick={() => onVote(m)}
                  className={`motion-safe:duration-200 motion-safe:ease-out flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-sm font-semibold shadow-sm transition-[transform,box-shadow,border-color] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 motion-reduce:transition-none sm:min-h-[5.5rem] ${MOOD_META[m].tile} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ec] ${
                    isLast
                      ? "ring-2 ring-stone-500/35 ring-offset-2 ring-offset-[#f4f1ec]"
                      : ""
                  }`}
                >
                  <MoodGlobe
                    mood={m}
                    size="icon"
                    title={`Vote ${m}`}
                  />
                  <span className="leading-tight tracking-tight">{m}</span>
                </button>
              );
            })}
          </div>
        </section>

        {lastVote && !loading ? (
          <div
            className="rounded-2xl border border-stone-200/80 bg-white/60 px-4 py-3 pl-5 shadow-sm backdrop-blur-sm"
            style={{
              boxShadow: `inset 5px 0 0 0 hsl(${MOOD_META[lastVote].glow})`,
            }}
          >
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed text-stone-800 sm:text-[0.9375rem]">
              <MoodGlobe
                mood={lastVote}
                size="icon"
                className="!h-9 !w-9"
                decorative
              />
              <span>
                Your{" "}
                <span className="font-semibold text-stone-900">{lastVote}</span>{" "}
                signal is live — you&apos;re part of today&apos;s collective
                mood.
              </span>
            </p>
          </div>
        ) : null}

        <section className="space-y-5 border-t border-stone-400/20 pt-10">
          <h2 className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:text-left">
            Today&apos;s snapshot
          </h2>

          {loading ? (
            <p className="text-sm text-stone-500">Loading…</p>
          ) : totalToday > 0 && leader ? (
            <>
              <div
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-md ring-2 sm:p-6 ${MOOD_META[leader].spotlight}`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Leading mood
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <MoodGlobe mood={leader} size="tile" />
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                      {leader}
                    </p>
                    <p className="mt-1 font-mono text-sm tabular-nums text-stone-600">
                      {Math.round(
                        ((todayCounts[leader] ?? 0) / totalToday) * 1000,
                      ) / 10}
                      % of today · {todayCounts[leader] ?? 0} votes
                    </p>
                  </div>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                {sortedForStrip.map((m) => {
                  const c = todayCounts[m] ?? 0;
                  const pct =
                    totalToday > 0
                      ? Math.round((c / totalToday) * 1000) / 10
                      : 0;
                  const isLead = m === leader && c > 0;
                  return (
                    <li key={m}>
                      <div
                        className={`flex h-full flex-col rounded-xl border bg-white/50 px-3 py-2.5 shadow-sm backdrop-blur-sm ${
                          isLead
                            ? "ring-1 ring-stone-300/80"
                            : "border-stone-200/90"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <MoodGlobe
                            mood={m}
                            size="icon"
                            className="!h-9 !w-9"
                            decorative
                          />
                          <span className="truncate text-right text-xs font-semibold text-stone-800">
                            {m}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between gap-2 font-mono text-[0.7rem] tabular-nums text-stone-500 sm:text-xs">
                          <span className="font-semibold text-stone-800">
                            {c}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200/90">
                          <div
                            className={`h-full rounded-full ${MOOD_META[m].bar} motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out`}
                            style={{
                              width: `${totalToday > 0 ? Math.max(6, (c / totalToday) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-stone-600">
              Once people vote, you&apos;ll see a full breakdown here — who&apos;s
              ahead, and how the mix shifts.
            </p>
          )}
        </section>

        <section className="space-y-5 border-t border-stone-400/20 pt-10">
          <h2 className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:text-left">
            Earlier
          </h2>
          {archiveDates.length === 0 ? (
            <p className="text-sm leading-relaxed text-stone-600">
              No earlier days yet — check back as this experiment grows.
            </p>
          ) : (
            <ul className="space-y-4">
              {archiveDates.map((date) => {
                const rows = archiveByDate.get(date) ?? [];
                const sorted = [...rows].sort((a, b) => b.votes - a.votes);
                const winner = sorted[0];
                const spoken = formatDateSpoken(date);
                return (
                  <li
                    key={date}
                    className="rounded-xl border border-stone-200/90 bg-white/40 px-4 py-3.5 backdrop-blur-sm"
                  >
                    {winner && winner.votes > 0 ? (
                      <p className="text-[0.9375rem] leading-relaxed text-stone-700">
                        <time
                          dateTime={date}
                          className="font-medium text-stone-900"
                        >
                          {spoken}
                        </time>
                        {" — "}the internet leaned{" "}
                        <span className="font-semibold text-stone-900">
                          {winner.mood}
                        </span>
                        .
                      </p>
                    ) : (
                      <p className="text-[0.9375rem] leading-relaxed text-stone-500">
                        <time dateTime={date} className="text-stone-700">
                          {spoken}
                        </time>{" "}
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
            className="rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-900 shadow-sm"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
