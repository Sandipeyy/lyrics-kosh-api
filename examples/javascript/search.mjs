const base = process.env.LYRICS_KOSH_URL ?? "http://localhost:8787";
const response = await fetch(`${base}/v1/search?q=${encodeURIComponent("Creep")}`);
console.log(await response.json());
