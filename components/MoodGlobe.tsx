"use client";

import { useId } from "react";
import type { Mood } from "@/lib/moods";

export type GlobeMood = Mood | "neutral";

type Props = {
  mood: GlobeMood;
  /** Hero centerpiece, vote buttons, or snapshot row */
  size: "hero" | "icon" | "tile";
  className?: string;
  /** Accessible name; omit when decorative (repeated next to text). */
  title?: string;
  /** Hide from AT when mood is labeled elsewhere (e.g. grid row). */
  decorative?: boolean;
};

const moodLabel: Record<GlobeMood, string> = {
  neutral: "Neutral, waiting for votes",
  Happy: "Happy expression",
  Sad: "Sad expression",
  Angry: "Angry expression",
  Anxious: "Anxious expression",
  Tired: "Tired expression",
  Excited: "Excited expression",
  Numb: "Numb expression",
  Calm: "Calm expression",
};

function Face({ mood }: { mood: GlobeMood }) {
  const common = {
    stroke: "#0f172a",
    strokeWidth: 1.75,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (mood) {
    case "neutral":
      return (
        <g opacity={0.92}>
          <circle cx="40" cy="44" r="3" fill="#0f172a" stroke="none" />
          <circle cx="60" cy="44" r="3" fill="#0f172a" stroke="none" />
          <path d="M 42 56 Q 50 60 58 56" {...common} strokeWidth={1.5} />
        </g>
      );
    case "Happy":
      return (
        <g opacity={0.95}>
          <path
            d="M 34 42 Q 40 38 46 42"
            {...common}
            strokeWidth={2}
            fill="none"
          />
          <path
            d="M 54 42 Q 60 38 66 42"
            {...common}
            strokeWidth={2}
            fill="none"
          />
          <path
            d="M 36 58 Q 50 70 64 58"
            {...common}
            strokeWidth={2.25}
          />
        </g>
      );
    case "Sad":
      return (
        <g opacity={0.95}>
          <path d="M 34 40 Q 40 46 46 40" {...common} strokeWidth={2} />
          <path d="M 54 40 Q 60 46 66 40" {...common} strokeWidth={2} />
          <path d="M 38 60 Q 50 52 62 60" {...common} strokeWidth={2} />
        </g>
      );
    case "Angry":
      return (
        <g opacity={0.95}>
          <path d="M 32 36 L 44 42" {...common} strokeWidth={2.25} />
          <path d="M 68 36 L 56 42" {...common} strokeWidth={2.25} />
          <circle cx="40" cy="46" r="2.8" fill="#0f172a" stroke="none" />
          <circle cx="60" cy="46" r="2.8" fill="#0f172a" stroke="none" />
          <path d="M 38 62 L 62 62" {...common} strokeWidth={2.5} />
        </g>
      );
    case "Anxious":
      return (
        <g opacity={0.95}>
          <ellipse
            cx="40"
            cy="45"
            rx="4"
            ry="5"
            {...common}
            fill="none"
            strokeWidth={2}
          />
          <ellipse
            cx="60"
            cy="45"
            rx="4"
            ry="5"
            {...common}
            fill="none"
            strokeWidth={2}
          />
          <path
            d="M 70 34 L 72 38 M 71 31 L 75 33"
            stroke="#0f172a"
            strokeWidth={1.25}
            strokeLinecap="round"
            opacity={0.6}
          />
          <path
            d="M 38 60 Q 44 58 50 62 Q 56 58 62 60"
            {...common}
            strokeWidth={1.75}
          />
        </g>
      );
    case "Tired":
      return (
        <g opacity={0.92}>
          <path d="M 34 46 L 46 46" {...common} strokeWidth={2.25} />
          <path d="M 54 46 L 66 46" {...common} strokeWidth={2.25} />
          <path d="M 38 46 L 38 50" {...common} strokeWidth={1.25} opacity={0.5} />
          <path d="M 62 46 L 62 50" {...common} strokeWidth={1.25} opacity={0.5} />
          <path d="M 44 60 Q 50 56 56 60" {...common} strokeWidth={1.75} />
        </g>
      );
    case "Excited":
      return (
        <g opacity={0.95}>
          <circle cx="40" cy="44" r="4" fill="#0f172a" stroke="none" />
          <circle cx="60" cy="44" r="4" fill="#0f172a" stroke="none" />
          <path
            d="M 34 58 Q 50 74 66 58"
            {...common}
            strokeWidth={2.5}
          />
          <path
            d="M 28 32 L 30 36 M 26 34 L 32 34"
            stroke="#fef3c7"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d="M 72 30 L 74 34 M 70 32 L 76 32"
            stroke="#fef3c7"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.85}
          />
        </g>
      );
    case "Numb":
      return (
        <g opacity={0.88}>
          <circle cx="40" cy="46" r="2.5" fill="#0f172a" stroke="none" />
          <circle cx="60" cy="46" r="2.5" fill="#0f172a" stroke="none" />
          <path d="M 38 60 L 62 60" {...common} strokeWidth={1.75} />
        </g>
      );
    case "Calm":
      return (
        <g opacity={0.92}>
          <path d="M 34 44 Q 40 40 46 44" {...common} strokeWidth={1.85} />
          <path d="M 54 44 Q 60 40 66 44" {...common} strokeWidth={1.85} />
          <path d="M 40 60 Q 50 66 60 60" {...common} strokeWidth={2} />
        </g>
      );
    default:
      return null;
  }
}

export function MoodGlobe({
  mood,
  size,
  className = "",
  title,
  decorative = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const gid = `globe-grad-${uid}`;
  const hid = `globe-hi-${uid}`;

  const dim =
    size === "hero"
      ? "w-[min(88vw,280px)] max-w-[280px] aspect-square"
      : size === "tile"
        ? "h-16 w-16 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]"
        : "h-11 w-11 shrink-0";

  const aria =
    title !== undefined && title.length > 0 ? title : moodLabel[mood];

  return (
    <svg
      className={`${dim} ${className}`}
      viewBox="0 0 100 100"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : aria}
    >
      {!decorative ? <title>{aria}</title> : null}
      <defs>
        <radialGradient id={gid} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#8ec5fc" />
          <stop offset="45%" stopColor="#4a8fd4" />
          <stop offset="100%" stopColor="#1e4a72" />
        </radialGradient>
        <radialGradient id={hid} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${gid})`} />
      <ellipse cx="34" cy="32" rx="16" ry="11" fill={`url(#${hid})`} />
      {/* subtle meridian */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="46"
        fill="none"
        stroke="white"
        strokeOpacity={0.08}
        strokeWidth={1}
      />
      <Face mood={mood} />
    </svg>
  );
}
