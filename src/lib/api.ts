export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await res.json().catch(() => null)) as { error?: string } | null;

  if (!res.ok) {
    throw new ApiError(
      body?.error ?? "Что-то пошло не так, попробуйте ещё раз",
      res.status,
    );
  }
  return body as T;
}
