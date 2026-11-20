const baseUrl = process.env.LYRICS_KOSH_URL || "http://localhost:8787";
const query = process.argv.slice(2).join(" ") || "track artist";
const response = await fetch(`${baseUrl}/v1/search?q=${encodeURIComponent(query)}`);
if (!response.ok) throw new Error(`Request failed: ${response.status}`);
console.log(JSON.stringify(await response.json(), null, 2));
