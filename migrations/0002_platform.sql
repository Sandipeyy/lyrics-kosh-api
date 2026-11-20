CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TEXT
);
CREATE TABLE IF NOT EXISTS api_usage (
  identity_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(identity_hash, window_start)
);
CREATE INDEX IF NOT EXISTS idx_api_usage_window ON api_usage(window_start);

CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  contributor_key_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration_ms INTEGER,
  plain_lyrics TEXT,
  synced_lyrics TEXT,
  rights_basis TEXT NOT NULL,
  rights_confirmed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  review_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status, created_at);

CREATE TABLE IF NOT EXISTS moderation_events (
  id TEXT PRIMARY KEY,
  contribution_id TEXT,
  event_type TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_metrics (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  status INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  provider TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON api_metrics(created_at);
