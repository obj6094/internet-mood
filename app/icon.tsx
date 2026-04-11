import { MOODS, type Mood } from "@/lib/moods";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const EASTERN_TIME_ZONE = "America/New_York";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const oceanLight = "#44b6d6";
const oceanMid = "#2f9fbe";
const land = "#67c96f";
const rim = "#3499ba";
const ink = "#10212d";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

function leadingMoodFor(counts: Record<string, number>): Mood | null {
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

function faceMarkup(mood: Mood | "neutral"): string {
  switch (mood) {
    case "neutral":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <circle cx="40" cy="50" r="3.2" fill="${ink}" stroke="none" />
          <circle cx="60" cy="50" r="3.2" fill="${ink}" stroke="none" />
          <path d="M 41 64 H 59" stroke-width="3.1" />
        </g>
      `;
    case "Happy":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <circle cx="40" cy="50" r="3.2" fill="${ink}" stroke="none" />
          <circle cx="60" cy="50" r="3.2" fill="${ink}" stroke="none" />
          <path d="M 39 59 Q 50 71 61 59" stroke-width="3.2" />
        </g>
      `;
    case "Sad":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <path d="M 34 47 Q 40 55 46 47" stroke-width="2.7" />
          <path d="M 54 47 Q 60 55 66 47" stroke-width="2.7" />
          <path d="M 39 67 Q 50 56 61 67" stroke-width="3.1" />
        </g>
      `;
    case "Angry":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <path d="M 31 42 L 45 48" stroke-width="3" />
          <path d="M 69 42 L 55 48" stroke-width="3" />
          <circle cx="40" cy="52" r="3.1" fill="${ink}" stroke="none" />
          <circle cx="60" cy="52" r="3.1" fill="${ink}" stroke="none" />
          <path d="M 38 65 Q 50 60 62 65" stroke-width="3.5" />
        </g>
      `;
    case "Anxious":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <path d="M 35 50 l5-3.5 l5 3.5 l-5 3.5 Z" fill="${ink}" stroke="none" />
          <path d="M 55 50 l5-3.5 l5 3.5 l-5 3.5 Z" fill="${ink}" stroke="none" />
          <path d="M 37 66 Q 43 60 50 66 Q 57 60 63 66" stroke-width="2.7" />
          <path d="M 29 38 l2 3 M 31 36 l3 2" stroke-width="1.4" />
          <path d="M 71 38 l-2 3 M 69 36 l-3 2" stroke-width="1.4" />
        </g>
      `;
    case "Tired":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <path d="M 33 51 H 47" stroke-width="3" />
          <path d="M 53 51 H 67" stroke-width="3" />
          <path d="M 42 66 Q 50 63 58 66" stroke-width="2.2" />
          <path d="M 34 46 Q 40 43 46 46" stroke-width="1.5" />
          <path d="M 54 46 Q 60 43 66 46" stroke-width="1.5" />
        </g>
      `;
    case "Calm":
      return `
        <g stroke="${ink}" fill="none" stroke-linecap="round">
          <path d="M 33 50 Q 40 46 47 50" stroke-width="2.2" />
          <path d="M 53 50 Q 60 46 67 50" stroke-width="2.2" />
          <path d="M 43 64 Q 50 67 57 64" stroke-width="2.2" />
        </g>
      `;
    default:
      return "";
  }
}

function buildIconSvg(mood: Mood | "neutral"): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 106 106">
      <defs>
        <clipPath id="earth">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${oceanLight}" />
          <stop offset="100%" stop-color="${oceanMid}" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#ocean)" />
      <g clip-path="url(#earth)">
        <path
          d="M 3 16 C 0 24 0 36 4 48 C 8 60 16 69 26 76 C 33 81 38 87 41 95 C 44 86 44 78 41 70 C 38 63 33 56 29 49 C 26 42 26 36 30 32 C 35 28 41 27 48 25 C 55 23 60 18 64 12 C 67 9 70 7 74 7 C 67 5 58 4 49 4 C 40 4 31 6 22 8 C 14 10 7 12 3 16 Z"
          fill="${land}"
        />
        <path
          d="M 74 16 C 68 21 65 29 64 38 C 63 46 65 54 69 60 C 73 66 79 69 86 69 C 91 69 95 71 98 75 C 101 79 103 84 106 90 C 108 83 108 75 105 67 C 102 60 97 55 92 52 C 88 49 85 45 85 41 C 85 37 88 35 92 35 C 96 35 100 33 103 30 C 106 27 108 22 109 17 C 103 14 97 13 91 13 C 84 13 79 14 74 16 Z"
          fill="${land}"
        />
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="${rim}" stroke-width="2" />
      ${faceMarkup(mood)}
    </svg>
  `.replace(/\s+/g, " ").trim();
}

async function loadHeroMood(): Promise<Mood | "neutral"> {
  const today = formatEasternIsoDate(new Date());
  if (!today) return "neutral";

  const rpc = await supabase.rpc("get_mood_vote_counts_for_day", {
    p_vote_date: today,
  });

  const counts: Record<string, number> = {};
  for (const mood of MOODS) counts[mood] = 0;

  if (!rpc.error && Array.isArray(rpc.data)) {
    for (const row of rpc.data as {
      mood: string;
      vote_count: number | string;
    }[]) {
      counts[row.mood] = Number(row.vote_count);
    }
    return leadingMoodFor(counts) ?? "neutral";
  }

  const res = await supabase
    .from("mood_votes")
    .select("mood")
    .eq("vote_date", today);

  if (res.error) return "neutral";

  for (const row of res.data ?? []) {
    const mood = row.mood as Mood;
    counts[mood] = (counts[mood] ?? 0) + 1;
  }

  return leadingMoodFor(counts) ?? "neutral";
}

export default async function Icon() {
  const mood = await loadHeroMood();
  const svg = buildIconSvg(mood);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
