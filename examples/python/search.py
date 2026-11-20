import json
import os
import sys
from urllib.request import urlopen
from urllib.parse import quote

base = os.getenv("LYRICS_KOSH_URL", "http://localhost:8787")
query = " ".join(sys.argv[1:]) or "track artist"
with urlopen(base + "/v1/search?q=" + quote(query), timeout=15) as response:
    print(json.dumps(json.loads(response.read()), indent=2))
