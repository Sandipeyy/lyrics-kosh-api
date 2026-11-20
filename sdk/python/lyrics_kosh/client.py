import json
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


class LyricsKosh:
    def __init__(self, base_url: str, api_key: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    def _get(self, path: str):
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        request = Request(self.base_url + path, headers=headers)
        try:
            with urlopen(request, timeout=15) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            raise RuntimeError(f"Lyrics Kosh API error: {exc.code}") from exc

    def search(self, query: str):
        return self._get("/v1/search?q=" + quote(query))

    def get_lyrics(self, provider: str, provider_id: str):
        return self._get(
            "/v1/lyrics/" + quote(provider, safe="") + "/" + quote(provider_id, safe="")
        )
