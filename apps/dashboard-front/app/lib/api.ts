export const apiBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

function joinUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${apiBaseUrl}${path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(joinUrl(path), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(joinUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
