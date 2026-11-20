import os
import requests

base = os.getenv("LYRICS_KOSH_URL", "http://localhost:8787")
response = requests.get(f"{base}/v1/search", params={"q": "Creep"}, timeout=10)
response.raise_for_status()
print(response.json())
