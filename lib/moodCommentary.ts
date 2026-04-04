import type { Mood } from "@/lib/moods";

/** Curated lines per leading mood — light, brand-safe, not copy-pasted from examples. */
export const LEADING_MOOD_COMMENTARY: Record<Mood, readonly string[]> = {
  Happy: [
    "The internet seems unusually upbeat today — maybe something went right.",
    "A warmer vibe than usual; the crowd’s leaning cheerful.",
    "There’s a little extra light in the feed today.",
  ],
  Sad: [
    "The mood’s a bit heavy out there — empathy’s not a bad instinct.",
    "Today’s signal skews melancholy; gentleness helps.",
    "Something feels tender in the collective tone.",
  ],
  Angry: [
    "Tension’s showing up in the mix — the internet’s a little on edge.",
    "Short fuses in the signal today; pace yourself online.",
    "The crowd reads irritable; maybe step back before you pile on.",
  ],
  Anxious: [
    "A restless undertone today — lots of nerves in the noise.",
    "Something feels unsettled in the airwaves.",
    "The signal’s jittery; breathe before you scroll.",
  ],
  Tired: [
    "Collective energy’s low — looks like the internet needs rest.",
    "A sleepy majority; nobody’s running on a full battery.",
    "The vibe says ‘one more tab and I’m done.’",
  ],
  Excited: [
    "Buzz is up — something has people wired today.",
    "There’s electricity in the signal; momentum’s real.",
    "The crowd’s animated; news or novelty might be moving the needle.",
  ],
  Numb: [
    "Flat affect wins today — feelings dialed way down.",
    "The signal’s oddly quiet, like a muted room.",
    "Not much emotional color in the mix; more static than spark.",
  ],
  Calm: [
    "Unusually steady waters — the internet feels composed today.",
    "A softer baseline than usual; less noise, more pause.",
    "The crowd’s reading relaxed; rare and nice when it lands.",
  ],
};

export const NEUTRAL_HERO_LINES = [
  "The globe’s still listening — first votes paint the picture.",
  "No signal yet today; your tap becomes part of the story.",
  "Quiet for now. The mood forms as people check in.",
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Stable line for the day + mood (changes with date or mood, not every render). */
export function leadingCommentaryLine(mood: Mood, dateKey: string): string {
  const lines = LEADING_MOOD_COMMENTARY[mood];
  return lines[hashString(`${dateKey}:${mood}`) % lines.length];
}

export function neutralHeroLine(dateKey: string): string {
  return NEUTRAL_HERO_LINES[hashString(`${dateKey}:neutral`) % NEUTRAL_HERO_LINES.length];
}
