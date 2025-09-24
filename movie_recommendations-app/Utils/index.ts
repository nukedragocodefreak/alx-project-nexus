export function truncate(text: string, n = 140): string {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "…" : text;
}

export async function fetchJSON<T = any>(
  url: string,
  opts?: RequestInit,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    ...(opts?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
