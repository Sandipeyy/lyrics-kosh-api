import { describe, expect, it } from "vitest";
import { parseLrc, scoreLyrics } from "../src/lib/lrc";
import { normalizeText, matchScore } from "../src/lib/normalize";
import { parseTtml } from "../src/lib/ttml";

describe("LRC parser", () => {
  it("parses and sorts timestamped lines", () => {
    const parsed = parseLrc("[00:12.50]second\n[00:01.00]first");
    expect(parsed.valid).toBe(true);
    expect(parsed.lines.map(line => line.text)).toEqual(["first", "second"]);
    expect(parsed.lines[0].timeMs).toBe(1000);
  });
  it("rejects malformed timestamps", () => {
    expect(parseLrc("[00:99.00]bad").valid).toBe(false);
  });
  it("scores synced lyrics above plain-only lyrics", () => {
    expect(scoreLyrics({ plainLyrics: "A sufficiently long lyric text for scoring." }))
      .toBeLessThan(scoreLyrics({ syncedLyrics: "[00:01.00]A sufficiently long lyric line." }));
  });
});

describe("matching", () => {
  it("normalizes accents and punctuation", () => {
    expect(normalizeText("Beyoncé — Déjà Vu")).toBe("beyonce deja vu");
  });
  it("scores close title and artist matches", () => {
    expect(matchScore(
      { title: "Song Name", artist: "Artist", durationMs: 180000 },
      { title: "Song Name", artist: "Artist", durationMs: 181000 }
    )).toBeGreaterThan(0.9);
  });
});

describe("TTML subset parser", () => {
  it("extracts timed paragraph text", () => {
    const lines = parseTtml('<tt><body><p begin="00:00:01.200" end="00:00:02.000">Hello &amp; hi</p></body></tt>');
    expect(lines).toEqual([{ beginMs: 1200, endMs: 2000, text: "Hello & hi" }]);
  });
});
