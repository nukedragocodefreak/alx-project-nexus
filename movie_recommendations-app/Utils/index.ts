export function truncate(text: string, n = 140): string {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "…" : text;
}

export async function fetchJSON<T = any>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json() as Promise<T>;
}
