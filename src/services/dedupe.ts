const pending = new Map<string, Promise<unknown>>();

export async function coalesce<T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> {
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;

  const current = operation();
  pending.set(key, current);

  try {
    return await current;
  } finally {
    if (pending.get(key) === current) pending.delete(key);
  }
}
