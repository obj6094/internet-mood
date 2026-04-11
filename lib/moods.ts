export const MOODS = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Tired",
  "Calm",
] as const;

export type Mood = (typeof MOODS)[number];
