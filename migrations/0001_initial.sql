CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration_ms INTEGER,
  isrc TEXT,
  title_key TEXT NOT NULL,
  artist_key TEXT NOT NULL,
  version_key TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_songs_title_artist ON songs(title_key, artist_key);
CREATE INDEX IF NOT EXISTS idx_songs_isrc ON songs(isrc);

CREATE TABLE IF NOT EXISTS provider_records (
  id TEXT PRIMARY KEY,
  song_id TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0,
  instrumental INTEGER NOT NULL DEFAULT 0,
  language TEXT,
  rights_status TEXT NOT NULL DEFAULT 'provider',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id),
  FOREIGN KEY(song_id) REFERENCES songs(id)
);
