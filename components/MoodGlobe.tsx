"use client";

import { useId } from "react";
import type { Mood } from "@/lib/moods";

export type GlobeMood = Mood | "neutral";

type Props = {
  mood: GlobeMood;
  size: "hero" | "icon" | "tile";
  className?: string;
  title?: string;
  decorative?: boolean;
};

const moodLabel: Record<GlobeMood, string> = {
  neutral: "Earth, neutral expression",
  Happy: "Earth, happy expression",
  Sad: "Earth, sad expression",
  Angry: "Earth, angry expression",
  Anxious: "Earth, anxious expression",
  Tired: "Earth, tired expression",
  Calm: "Earth, calm expression",
};

const oceanLight = "#44b6d6";
const oceanMid = "#2f9fbe";
const land = "#67c96f";
const rim = "#3499ba";
const ink = "#10212d";
const GLOBE_VIEWBOX = "-3 -3 106 106";

function Continents({ clipId }: { clipId: string }) {
  return (
    <g clipPath={`url(#${clipId})`}>
      <path
        d="M 3 16 C 0 24 0 36 4 48 C 8 60 16 69 26 76 C 33 81 38 87 41 95 C 44 86 44 78 41 70 C 38 63 33 56 29 49 C 26 42 26 36 30 32 C 35 28 41 27 48 25 C 55 23 60 18 64 12 C 67 9 70 7 74 7 C 67 5 58 4 49 4 C 40 4 31 6 22 8 C 14 10 7 12 3 16 Z"
        fill={land}
      />
      <path
        d="M 74 16 C 68 21 65 29 64 38 C 63 46 65 54 69 60 C 73 66 79 69 86 69 C 91 69 95 71 98 75 C 101 79 103 84 106 90 C 108 83 108 75 105 67 C 102 60 97 55 92 52 C 88 49 85 45 85 41 C 85 37 88 35 92 35 C 96 35 100 33 103 30 C 106 27 108 22 109 17 C 103 14 97 13 91 13 C 84 13 79 14 74 16 Z"
        fill={land}
      />
    </g>
  );
}

function Face({ mood }: { mood: GlobeMood }) {
  const cap = "round" as const;

  switch (mood) {
    case "neutral":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <circle cx="40" cy="50" r="3.2" fill={ink} stroke="none" />
          <circle cx="60" cy="50" r="3.2" fill={ink} stroke="none" />
          <path d="M 41 64 H 59" strokeWidth="3.1" />
        </g>
      );
    case "Happy":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <circle cx="40" cy="50" r="3.2" fill={ink} stroke="none" />
          <circle cx="60" cy="50" r="3.2" fill={ink} stroke="none" />
          <path d="M 39 59 Q 50 71 61 59" strokeWidth="3.2" />
        </g>
      );
    case "Sad":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <path d="M 34 47 Q 40 55 46 47" strokeWidth="2.7" />
          <path d="M 54 47 Q 60 55 66 47" strokeWidth="2.7" />
          <path d="M 39 67 Q 50 56 61 67" strokeWidth="3.1" />
        </g>
      );
    case "Angry":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <path d="M 31 42 L 45 48" strokeWidth="3" />
          <path d="M 69 42 L 55 48" strokeWidth="3" />
          <circle cx="40" cy="52" r="3.1" fill={ink} stroke="none" />
          <circle cx="60" cy="52" r="3.1" fill={ink} stroke="none" />
          <path d="M 38 65 Q 50 60 62 65" strokeWidth="3.5" />
        </g>
      );
    case "Anxious":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <path d="M 35 50 l5-3.5 l5 3.5 l-5 3.5 Z" fill={ink} stroke="none" />
          <path d="M 55 50 l5-3.5 l5 3.5 l-5 3.5 Z" fill={ink} stroke="none" />
          <path d="M 37 66 Q 43 60 50 66 Q 57 60 63 66" strokeWidth="2.7" />
          <path d="M 29 38 l2 3 M 31 36 l3 2" strokeWidth="1.4" />
          <path d="M 71 38 l-2 3 M 69 36 l-3 2" strokeWidth="1.4" />
        </g>
      );
    case "Tired":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <path d="M 33 51 H 47" strokeWidth="3" />
          <path d="M 53 51 H 67" strokeWidth="3" />
          <path d="M 42 66 Q 50 63 58 66" strokeWidth="2.2" />
          <path d="M 34 46 Q 40 43 46 46" strokeWidth="1.5" />
          <path d="M 54 46 Q 60 43 66 46" strokeWidth="1.5" />
        </g>
      );
    case "Calm":
      return (
        <g stroke={ink} fill="none" strokeLinecap={cap}>
          <path d="M 33 50 Q 40 46 47 50" strokeWidth="2.2" />
          <path d="M 53 50 Q 60 46 67 50" strokeWidth="2.2" />
          <path d="M 43 64 Q 50 67 57 64" strokeWidth="2.2" />
        </g>
      );
    default:
      return null;
  }
}

function faceMarkup(mood: GlobeMood): string {
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

export function createMoodGlobeFaviconDataUrl(mood: GlobeMood): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${GLOBE_VIEWBOX}">
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

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function MoodGlobe({
  mood,
  size,
  className = "",
  title,
  decorative = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const oceanId = `ocean-${uid}`;
  const clipId = `earth-${uid}`;

  const dim =
    size === "hero"
      ? "w-[min(88vw,280px)] max-w-[280px] aspect-square"
      : size === "tile"
        ? "h-[4.6rem] w-[4.6rem] shrink-0 sm:h-[5.1rem] sm:w-[5.1rem]"
        : "h-[2.9rem] w-[2.9rem] shrink-0";

  const aria =
    title !== undefined && title.length > 0 ? title : moodLabel[mood];

  return (
    <svg
      className={`block ${dim} ${className}`}
      viewBox={GLOBE_VIEWBOX}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : aria}
    >
      {!decorative ? <title>{aria}</title> : null}
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <linearGradient id={oceanId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={oceanLight} />
          <stop offset="100%" stopColor={oceanMid} />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="50" fill={`url(#${oceanId})`} />
      <Continents clipId={clipId} />
      <circle cx="50" cy="50" r="49" fill="none" stroke={rim} strokeWidth="2" />
      <Face mood={mood} />
    </svg>
  );
}
