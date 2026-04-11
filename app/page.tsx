"use client";

import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MoodGlobe,
  createMoodGlobeFaviconDataUrl,
} from "@/components/MoodGlobe";
import {
  MOOD_PERSONIFICATION_LINES,
  PERSONIFICATION_LINE_COUNT,
  neutralHeroLine,
} from "@/lib/moodCommentary";
import { MOODS, type Mood } from "@/lib/moods";
import { supabase } from "@/lib/supabase";

const EASTERN_TIME_ZONE = "America/New_York";

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
    glow: "42 78% 60%",
    tile:
      "border-[#E9B949]/45 bg-gradient-to-br from-[#E9B949]/14 to-[#E9B949]/24 text-stone-900 shadow-black/5 hover:border-[#E9B949]/80 hover:shadow-md hover:shadow-black/10",
    strip: "bg-[#E9B949]",
    bar: "bg-[#E9B949]",
    spotlight:
      "from-[#F2E08A] to-[#D4A832] border-[#C9A038] ring-[#E9B949]/45",
  },
  Sad: {
    glow: "212 82% 58%",
    tile:
      "border-[#3D94E8]/45 bg-gradient-to-br from-[#3D94E8]/14 to-[#3D94E8]/24 text-stone-900 shadow-black/5 hover:border-[#3D94E8]/80 hover:shadow-md hover:shadow-black/10",
    strip: "bg-[#3D94E8]",
    bar: "bg-[#3D94E8]",
    spotlight:
      "from-[#6CB0F0] to-[#2E7FD4] border-[#2B6FC4] ring-[#3D94E8]/45",
  },
  Angry: {
    glow: "0 70% 62%",
    tile:
      "border-[#E35A5A]/45 bg-gradient-to-br from-[#E35A5A]/14 to-[#E35A5A]/24 text-stone-900 shadow-black/5 hover:border-[#E35A5A]/80 hover:shadow-md hover:shadow-black/10",
    strip: "bg-[#E35A5A]",
    bar: "bg-[#E35A5A]",
    spotlight:
      "from-[#F08080] to-[#D04040] border-[#C03838] ring-[#E35A5A]/45",
  },
  Anxious: {
    glow: "292 62% 72%",
    tile:
      "border-[#D090E0]/45 bg-gradient-to-br from-[#D090E0]/14 to-[#D090E0]/24 text-stone-900 shadow-black/5 hover:border-[#D090E0]/80 hover:shadow-md hover:shadow-black/10",
    strip: "bg-[#D090E0]",
    bar: "bg-[#D090E0]",
    spotlight:
      "from-[#E0B0F0] to-[#B870D0] border-[#A860C0] ring-[#D090E0]/45",
  },
  Tired: {
    glow: "234 16% 54%",
    tile:
      "border-[#7C7F98]/45 bg-gradient-to-br from-[#7C7F98]/14 to-[#7C7F98]/24 text-stone-900 shadow-black/5 hover:border-[#7C7F98]/80 hover:shadow-md hover:shadow-black/10",
    strip: "bg-[#7C7F98]",
    bar: "bg-[#7C7F98]",
    spotlight:
      "from-[#9A9DB5] to-[#65687E] border-[#5A5D72] ring-[#7C7F98]/45",
  },
  Calm: {
    glow: "152 44% 55%",
    tile:
      "border-[#5BBF8A]/45 bg-gradient-to-br from-[#5BBF8A]/14 to-[#5BBF8A]/24 text-stone-900 shadow-black/5 hover:border-[#5BBF8A]/80 hover:shadow-md hover:shadow-black/10",
    strip: "bg-[#5BBF8A]",
    bar: "bg-[#5BBF8A]",
    spotlight:
      "from-[#7AD4A8] to-[#4AA876] border-[#3F9668] ring-[#5BBF8A]/45",
  },
};

function formatEasternIsoDate(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EASTERN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

function formatDateSpoken(isoDate: string): string {
  const [y, mo, d] = isoDate.slice(0, 10).split("-").map(Number);
  if (!y || !mo || !d) return isoDate;

  const date = new Date(Date.UTC(y, mo - 1, d, 12));
  return date.toLocaleDateString("en-US", {
    timeZone: EASTERN_TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTodayLabel(iso: string): string {
  const [y, mo, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !mo || !d) return iso;

  const date = new Date(Date.UTC(y, mo - 1, d, 12));
  return date.toLocaleDateString("en-US", {
    timeZone: EASTERN_TIME_ZONE,
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

  for (const mood of MOODS) {
    const count = counts[mood] ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = mood;
    }
  }

  return best;
}

type ArchiveRow = {
  vote_date: string;
  mood: string;
  votes: number;
};

function initialNextPersonificationLineMap(): Record<Mood, number> {
  const result = {} as Record<Mood, number>;
  for (const mood of MOODS) result[mood] = 0;
  return result;
}

export default function Home() {
  const today = useMemo(() => formatEasternIsoDate(new Date()), []);

  const [todayCounts, setTodayCounts] = useState<Record<string, number>>({});
  const [archiveByDate, setArchiveByDate] = useState<
    Map<string, ArchiveRow[]>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVote, setLastVote] = useState<Mood | null>(null);
  const [topMoodPersonification, setTopMoodPersonification] = useState<{
    mood: Mood;
    lineIndex: number;
  } | null>(null);

  const prevTopMoodRef = useRef<Mood | undefined>(undefined);
  const nextPersonificationLineForMoodRef = useRef<Record<Mood, number>>(
    initialNextPersonificationLineMap(),
  );

  const emptyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mood of MOODS) counts[mood] = 0;
    return counts;
  }, []);

  const syncTopMoodPersonification = useCallback(
    (counts: Record<string, number>) => {
      const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
      const nextLeader = leadingMoodFor(counts, total);

      if (total === 0 || !nextLeader) {
        prevTopMoodRef.current = undefined;
        setTopMoodPersonification(null);
        return;
      }

      if (prevTopMoodRef.current === nextLeader) return;

      const index = nextPersonificationLineForMoodRef.current[nextLeader];
      setTopMoodPersonification({ mood: nextLeader, lineIndex: index });
      nextPersonificationLineForMoodRef.current = {
        ...nextPersonificationLineForMoodRef.current,
        [nextLeader]: (index + 1) % PERSONIFICATION_LINE_COUNT,
      };
      prevTopMoodRef.current = nextLeader;
    },
    [],
  );

  const loadTodayCounts = useCallback(async () => {
    const rpc = await supabase.rpc("get_mood_vote_counts_for_day", {
      p_vote_date: today,
    });

    if (!rpc.error && Array.isArray(rpc.data)) {
      const counts: Record<string, number> = { ...emptyCounts };
      for (const row of rpc.data as {
        mood: string;
        vote_count: number | string;
      }[]) {
        counts[row.mood] = Number(row.vote_count);
      }
      return { error: null, counts };
    }

    const res = await supabase
      .from("mood_votes")
      .select("mood")
      .eq("vote_date", today);

    if (res.error) {
      const rpcHint = rpc.error?.message ? ` (${rpc.error.message})` : "";
      return { error: res.error.message + rpcHint, counts: null };
    }

    const counts: Record<string, number> = { ...emptyCounts };
    for (const row of res.data ?? []) {
      counts[row.mood as string] = (counts[row.mood as string] ?? 0) + 1;
    }

    return { error: null, counts };
  }, [emptyCounts, today]);

  const loadArchive = useCallback(async () => {
    const archRes = await supabase
      .from("daily_mood_archive")
      .select("vote_date, mood, votes")
      .order("vote_date", { ascending: false });

    if (archRes.error) return { error: archRes.error.message, map: null };

    const map = new Map<string, ArchiveRow[]>();
    for (const row of archRes.data ?? []) {
      const date = String(row.vote_date).slice(0, 10);
      const list = map.get(date) ?? [];
      list.push({
        vote_date: date,
        mood: row.mood,
        votes: row.votes,
      });
      map.set(date, list);
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
    const counts = todayRes.counts ?? {};
    setTodayCounts(counts);
    syncTopMoodPersonification(counts);
    setArchiveByDate(archRes.map ?? new Map());
    setLoading(false);
  }, [loadArchive, loadTodayCounts, syncTopMoodPersonification]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadInitial();
    }, 0);

    return () => clearTimeout(timeout);
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
      const countA = todayCounts[a] ?? 0;
      const countB = todayCounts[b] ?? 0;
      if (countB !== countA) return countB - countA;
      return MOODS.indexOf(a) - MOODS.indexOf(b);
    });
  }, [todayCounts]);

  const heroGlobeMood = useMemo(() => {
    if (loading || totalToday === 0) return "neutral";
    return leader ?? "neutral";
  }, [leader, loading, totalToday]);

  useEffect(() => {
    const faviconHref = createMoodGlobeFaviconDataUrl(heroGlobeMood);
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]',
      ),
    );

    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = faviconHref;
      document.head.appendChild(link);
      return;
    }

    for (const link of links) {
      link.type = "image/svg+xml";
      link.href = faviconHref;
    }
  }, [heroGlobeMood]);

  async function onVote(mood: Mood) {
    if (loading) return;

    setError(null);
    setLastVote(mood);
    const optimisticCounts = {
      ...todayCounts,
      [mood]: (todayCounts[mood] ?? 0) + 1,
    };
    setTodayCounts(optimisticCounts);
    syncTopMoodPersonification(optimisticCounts);

    const { error: insertError } = await supabase.from("mood_votes").insert({
      mood,
      vote_date: today,
    });

    if (insertError) {
      setError(insertError.message);
      setLastVote(null);
      const revertedCounts = {
        ...optimisticCounts,
        [mood]: Math.max(0, (optimisticCounts[mood] ?? 0) - 1),
      };
      setTodayCounts(revertedCounts);
      syncTopMoodPersonification(revertedCounts);
      return;
    }

    const reload = await loadTodayCounts();
    if (reload.counts) {
      setTodayCounts(reload.counts);
      syncTopMoodPersonification(reload.counts);
      setError(null);
    } else if (reload.error) {
      setError(
        `${reload.error} Your vote may still be saved; try refreshing.`,
      );
    }
  }

  const archiveDates = useMemo(() => {
    return [...archiveByDate.keys()]
      .filter((date) => date !== today)
      .sort()
      .reverse()
      .slice(0, 7);
  }, [archiveByDate, today]);

  const shellStyle = useMemo(() => {
    const glow = leader ? MOOD_META[leader].glow : "32 18% 72%";
    return {
      "--atmosphere-glow": glow,
    } as CSSProperties;
  }, [leader]);

  return (
    <div className="page-shell relative z-10 min-h-full" style={shellStyle}>
      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-10 px-4 py-10 pb-20 sm:gap-12 sm:py-14">
        <header className="space-y-6">
          <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone-500 sm:text-left sm:text-xs">
            Internet mood · <time dateTime={today}>{formatTodayLabel(today)}</time>{" "}
            · ET
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
                  {neutralHeroLine(today)}
                </p>
                <p className="text-pretty text-sm leading-relaxed text-stone-500">
                  Tap a mood below and your vote becomes part of the live
                  snapshot.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-xl space-y-3 text-center sm:text-left">
                <p className="text-sm font-medium text-stone-500 sm:text-base">
                  Right now, the internet feels
                </p>
                <h1 className="block max-w-full pb-1 text-balance bg-gradient-to-br from-stone-950 via-stone-900 to-stone-700 bg-clip-text text-[1.9rem] font-black leading-[1.12] tracking-[-0.015em] text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] sm:text-[2.6rem]">
                  {leader ?? "-"}
                </h1>
                {leader &&
                topMoodPersonification &&
                topMoodPersonification.mood === leader ? (
                  <p className="min-h-[4.75rem] max-w-[34rem] text-pretty text-base leading-relaxed text-stone-700 sm:min-h-[4.25rem] sm:text-[1.05rem]">
                    {
                      MOOD_PERSONIFICATION_LINES[leader][
                        topMoodPersonification.lineIndex
                      ]
                    }
                  </p>
                ) : null}
                {leader ? (
                  <p className="font-mono text-sm tabular-nums text-stone-600 sm:text-base">
                    <span className="font-semibold text-stone-800">
                      {totalToday} votes
                    </span>
                    <span className="text-stone-400"> · </span>
                    <span>
                      {Math.round(
                        ((todayCounts[leader] ?? 0) / totalToday) * 1000,
                      ) / 10}
                      % today
                    </span>
                  </p>
                ) : null}
              </div>
            )}
          </div>

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
                MOODS.map((mood) => (
                  <div
                    key={mood}
                    className={`min-w-px flex-1 ${MOOD_META[mood].strip} opacity-[0.18]`}
                  />
                ))
              ) : (
                sortedForStrip.map((mood) => {
                  const count = todayCounts[mood] ?? 0;
                  return (
                    <div
                      key={mood}
                      className={`min-w-0 ${MOOD_META[mood].strip} motion-safe:transition-[flex-grow] motion-safe:duration-500 motion-safe:ease-out`}
                      style={{ flex: Math.max(count, 0) }}
                      title={`${mood}: ${count}`}
                    />
                  );
                })
              )}
            </div>
            <p className="mt-2 text-center text-[0.65rem] font-medium uppercase tracking-[0.18em] text-stone-400 sm:text-left">
              Today&apos;s mood mix
            </p>
          </div>
        </header>

        <section aria-label="Cast your mood vote" className="space-y-3">
          <h2 className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:text-left">
            How are you feeling today?
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3">
            {MOODS.map((mood) => {
              const isLast = lastVote === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  disabled={loading}
                  onClick={() => onVote(mood)}
                  className={`motion-safe:duration-200 motion-safe:ease-out flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-sm font-semibold shadow-sm transition-[transform,box-shadow,border-color] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 motion-reduce:transition-none sm:min-h-[5.5rem] ${MOOD_META[mood].tile} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1ec] ${
                    isLast
                      ? "ring-2 ring-stone-500/35 ring-offset-2 ring-offset-[#f4f1ec]"
                      : ""
                  }`}
                >
                  <MoodGlobe mood={mood} size="icon" title={`Vote ${mood}`} />
                  <span className="leading-tight tracking-tight">{mood}</span>
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
                You&apos;re feeling {lastVote.toLowerCase()}. You&apos;re now
                part of today&apos;s internet mood.
              </span>
            </p>
          </div>
        ) : null}

        <section className="space-y-5 border-t border-stone-400/20 pt-10">
          <h2 className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500 sm:text-left">
            Today&apos;s Internet Mood
          </h2>

          {loading ? (
            <p className="text-sm text-stone-500">Loading…</p>
          ) : totalToday > 0 && leader ? (
            <>
              <div
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-md ring-2 sm:p-6 ${MOOD_META[leader].spotlight}`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Top mood
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <MoodGlobe mood={leader} size="tile" />
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                      {leader}
                    </p>
                    <p className="mt-1 font-mono text-sm tabular-nums text-stone-600">
                      {todayCounts[leader] ?? 0} votes ·{" "}
                      {Math.round(
                        ((todayCounts[leader] ?? 0) / totalToday) * 1000,
                      ) / 10}
                      % today
                    </p>
                  </div>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {sortedForStrip.map((mood) => {
                  const count = todayCounts[mood] ?? 0;
                  const pct =
                    totalToday > 0
                      ? Math.round((count / totalToday) * 1000) / 10
                      : 0;
                  const isLead = mood === leader && count > 0;

                  return (
                    <li key={mood}>
                      <div
                        className={`flex h-full flex-col rounded-xl border bg-white/50 px-3 py-2.5 shadow-sm backdrop-blur-sm ${
                          isLead
                            ? "ring-1 ring-stone-300/80"
                            : "border-stone-200/90"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <MoodGlobe
                            mood={mood}
                            size="icon"
                            className="!h-9 !w-9"
                            decorative
                          />
                          <span className="truncate text-right text-xs font-semibold text-stone-800">
                            {mood}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between gap-2 font-mono text-[0.7rem] tabular-nums text-stone-500 sm:text-xs">
                          <span className="font-semibold text-stone-800">
                            {count}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200/90">
                          <div
                            className={`h-full rounded-full ${MOOD_META[mood].bar} motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out`}
                            style={{
                              width: `${totalToday > 0 ? Math.max(6, (count / totalToday) * 100) : 0}%`,
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
              Once people vote, you&apos;ll see a full breakdown here: who&apos;s
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
              No earlier days yet. Check back as this experiment grows.
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
                        {" · "}the internet felt{" "}
                        <span className="font-semibold text-stone-900">
                          {String(winner.mood).toLowerCase()}
                        </span>
                        .
                      </p>
                    ) : (
                      <p className="text-[0.9375rem] leading-relaxed text-stone-500">
                        <time dateTime={date} className="text-stone-700">
                          {spoken}
                        </time>{" "}
                        · no votes recorded.
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



