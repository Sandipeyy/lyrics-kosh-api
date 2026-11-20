const VERSION_WORDS = [
  "live", "acoustic", "remix", "instrumental", "karaoke", "sped up",
  "slowed", "demo", "cover", "radio edit", "extended", "nightcore"
];

export function normalizeText(value: string): string {
  return value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function versionKey(title: string): string {
  const normalized = normalizeText(title);
  return VERSION_WORDS.filter(word => normalized.includes(word)).sort().join("|");
}

export function tokenSimilarity(a: string, b: string): number {
  const left = new Set(normalizeText(a).split(" ").filter(Boolean));
  const right = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection++;
  return (2 * intersection) / (left.size + right.size);
}

export function matchScore(
  candidate: { title: string; artist: string; durationMs?: number | null },
  target: { title: string; artist: string; durationMs?: number | null }
): number {
  const title = tokenSimilarity(candidate.title, target.title);
  const artist = tokenSimilarity(candidate.artist, target.artist);
  let duration = 0.5;
  if (candidate.durationMs && target.durationMs) {
    const difference = Math.abs(candidate.durationMs - target.durationMs);
    duration = difference <= 3000 ? 1 : difference <= 12000 ? 0.65 : 0;
  }
  const version = versionKey(candidate.title) === versionKey(target.title) ? 1 : 0;
  return Math.min(1, title * 0.42 + artist * 0.33 + duration * 0.15 + version * 0.10);
}
