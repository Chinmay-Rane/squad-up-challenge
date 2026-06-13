export const LEVELS = ["easy", "medium", "hard", "very_hard", "impossible"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_META: Record<Level, { label: string; color: string; order: number }> = {
  easy: { label: "Easy", color: "bg-emerald-500 text-white", order: 1 },
  medium: { label: "Medium", color: "bg-yellow-500 text-black", order: 2 },
  hard: { label: "Hard", color: "bg-orange-500 text-white", order: 3 },
  very_hard: { label: "Very Hard", color: "bg-red-600 text-white", order: 4 },
  impossible: { label: "Impossible", color: "bg-purple-700 text-white", order: 5 },
};

// 10 questions: 2 per level
export const QUESTIONS_PER_LEVEL = 2;
export const TOTAL_QUESTIONS = LEVELS.length * QUESTIONS_PER_LEVEL;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Format ms → "1:23.456"
export function formatLap(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${m}:${s.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
}

// Format gap to leader: "+0.024"
export function formatGap(ms: number): string {
  const sec = ms / 1000;
  return `+${sec.toFixed(3)}`;
}

// Parse "M:SS.mmm" or "SS.mmm" or "12345" (ms) → ms
export function parseLap(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // pure number = ms
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  // M:SS.mmm
  const m = trimmed.match(/^(\d+):(\d{1,2})(?:\.(\d{1,3}))?$/);
  if (m) {
    const min = parseInt(m[1], 10);
    const sec = parseInt(m[2], 10);
    const millis = m[3] ? parseInt(m[3].padEnd(3, "0"), 10) : 0;
    if (sec >= 60) return null;
    return min * 60000 + sec * 1000 + millis;
  }
  // SS.mmm
  const s = trimmed.match(/^(\d+)\.(\d{1,3})$/);
  if (s) {
    return parseInt(s[1], 10) * 1000 + parseInt(s[2].padEnd(3, "0"), 10);
  }
  return null;
}
