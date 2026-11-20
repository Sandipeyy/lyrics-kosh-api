export interface LrcLine {
  timeMs: number;
  text: string;
}

export interface ParsedLrc {
  lines: LrcLine[];
  valid: boolean;
  errors: string[];
}

const TIMESTAMP = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

export function parseLrc(input: string): ParsedLrc {
  const lines: LrcLine[] = [];
  const errors: string[] = [];
  for (const raw of input.split(/\r?\n/)) {
    const matches = [...raw.matchAll(TIMESTAMP)];
    if (!matches.length) continue;
    const text = raw.replace(TIMESTAMP, "").trim();
    for (const match of matches) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = (match[3] ?? "0").padEnd(3, "0").slice(0, 3);
      if (seconds > 59) {
        errors.push("Timestamp seconds must be below 60.");
        continue;
      }
      lines.push({ timeMs: (minutes * 60 + seconds) * 1000 + Number(fraction), text });
    }
  }
  lines.sort((a, b) => a.timeMs - b.timeMs);
  if (!lines.length) errors.push("No valid LRC timestamps found.");
  return { lines, valid: lines.length > 0 && errors.length === 0, errors };
}

export function scoreLyrics(input: { plainLyrics?: string | null; syncedLyrics?: string | null; instrumental?: boolean }): number {
  if (input.instrumental) return 1;
  const plain = (input.plainLyrics ?? "").trim();
  const synced = (input.syncedLyrics ?? "").trim();
  let score = 0;
  if (plain.length >= 30) score += 0.35;
  if (synced.length >= 30) {
    const parsed = parseLrc(synced);
    if (parsed.valid) score += 0.55;
    else score += 0.1;
  }
  if (plain && synced) score += 0.1;
  return Math.min(1, score);
}
