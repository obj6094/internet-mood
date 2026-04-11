import type { Mood } from "@/lib/moods";

/** Exactly 6 lines per mood, in display order (cycle 0→5). */
export const MOOD_PERSONIFICATION_LINES: Record<Mood, readonly [string, string, string, string, string, string]> = {
  Happy: [
    "The internet looks happy today. It’s nice to see it smiling.",
    "What made the internet this cheerful today?",
    "The internet seems to be in a good mood.",
    "A happy internet is a lovely thing to see.",
    "Something seems to have brightened the internet today.",
    "The internet is smiling today. Maybe something good happened.",
  ],
  Sad: [
    "The internet feels a little sad today. What happened?",
    "A sad internet makes the whole day feel softer.",
    "The internet looks down today. Be gentle with it.",
    "Something must have weighed on the internet today.",
    "The internet seems a bit blue today.",
    "It’s a sad internet today. Maybe it just needs a moment.",
  ],
  Angry: [
    "The internet is angry today. What set it off?",
    "A grumpy internet is making some noise today.",
    "The internet seems tense today. Maybe it needs to cool down.",
    "Something clearly annoyed the internet today.",
    "The internet is in a fiery mood today.",
    "An angry internet can be loud. Let’s hope it settles soon.",
  ],
  Anxious: [
    "The internet seems nervous today. Deep breaths.",
    "The internet is feeling anxious today. Let’s be kind to it.",
    "Something has the internet on edge today.",
    "The internet is trembling a little today.",
    "An uneasy mood is spreading across the internet today.",
    "The internet feels tense today. Maybe it needs a moment to breathe.",
  ],
  Tired: [
    "The internet looks tired today. Maybe it needs a nap.",
    "A sleepy internet is drifting through the day.",
    "The internet seems worn out today.",
    "It’s a tired internet today. Let it rest a little.",
    "The internet is moving a little slowly today.",
    "Looks like the internet could use some extra sleep today.",
  ],
  Calm: [
    "The internet feels calm today. That’s rare and lovely.",
    "A peaceful internet is a nice surprise.",
    "The internet seems unusually relaxed today.",
    "Everything feels softer when the internet is calm.",
    "The internet is at ease today. Let’s enjoy it.",
    "It’s a calm day online. Peace looks good on the internet.",
  ],
};

export const PERSONIFICATION_LINE_COUNT = 6;

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

export function neutralHeroLine(dateKey: string): string {
  return NEUTRAL_HERO_LINES[hashString(`${dateKey}:neutral`) % NEUTRAL_HERO_LINES.length];
}
