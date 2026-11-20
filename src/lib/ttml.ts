export interface TtmlLine {
  beginMs: number;
  endMs: number | null;
  text: string;
}

/**
 * Lightweight TTML extraction for common <p begin="..." end="..."> lines.
 * This intentionally supports a safe subset rather than pretending to be a
 * complete XML/TTML implementation. Unsupported timing expressions are skipped.
 */
function timeToMs(value: string | undefined): number | null {
  if (!value) return null;
  const clock = value.match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if (clock) return ((+clock[1] * 3600 + +clock[2] * 60 + +clock[3]) * 1000) + Number((clock[4] ?? "0").padEnd(3, "0").slice(0, 3));
  const seconds = value.match(/^(\d+(?:\.\d+)?)s$/);
  if (seconds) return Math.round(Number(seconds[1]) * 1000);
  const ms = value.match(/^(\d+(?:\.\d+)?)ms$/);
  if (ms) return Math.round(Number(ms[1]));
  return null;
}

function decodeXml(value: string): string {
  return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

export function parseTtml(xml: string): TtmlLine[] {
  const output: TtmlLine[] = [];
  const paragraph = /<p\b([^>]*)>([\s\S]*?)<\/p>/gi;
  for (const match of xml.matchAll(paragraph)) {
    const attrs = match[1];
    const begin = attrs.match(/\bbegin=["']([^"']+)["']/i)?.[1];
    const end = attrs.match(/\bend=["']([^"']+)["']/i)?.[1];
    const beginMs = timeToMs(begin);
    if (beginMs === null) continue;
    const text = decodeXml(match[2].replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();
    if (text) output.push({ beginMs, endMs: timeToMs(end), text });
  }
  return output.sort((a, b) => a.beginMs - b.beginMs);
}
