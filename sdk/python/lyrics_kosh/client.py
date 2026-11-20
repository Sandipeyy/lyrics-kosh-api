import httpx


class LyricsKoshError(Exception):
    def __init__(self, message: str, status_code: int = 0):
        super().__init__(message)
        self.status_code = status_code


class LyricsKosh:
    def __init__(self, base_url: str, api_key: str | None = None, timeout: float = 10):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.headers = {"Accept": "application/json"}
        if api_key:
            self.headers["Authorization"] = f"Bearer {api_key}"

    def _get(self, path: str, params: dict | None = None):
        try:
            response = httpx.get(
                self.base_url + path,
                params=params,
                headers=self.headers,
                timeout=self.timeout,
            )
        except httpx.TimeoutException as exc:
            raise LyricsKoshError("Request timed out", 408) from exc
        except httpx.HTTPError as exc:
            raise LyricsKoshError("Network request failed") from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise LyricsKoshError("Invalid JSON response", response.status_code) from exc

        if not response.is_success:
            raise LyricsKoshError(payload.get("error", "Request failed"), response.status_code)
        return payload

    def search(self, query: str):
        return self._get("/v1/search", {"q": query})

    def get_lyrics(self, record_id: str, provider: str):
        return self._get("/v1/lyrics", {"id": record_id, "provider": provider})

    def providers(self):
        return self._get("/v1/providers")

    def health(self):
        return self._get("/v1/health")
