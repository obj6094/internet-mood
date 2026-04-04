export const MOODS = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Tired",
  "Excited",
  "Numb",
  "Calm",
] as const;

export type Mood = (typeof MOODS)[number];
