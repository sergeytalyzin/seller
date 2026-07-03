const OZON_API_URL = "https://api-seller.ozon.ru";

export class OzonApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OzonApiError";
  }
}

export type OzonCredentials = {
  clientId: string;
  apiKey: string;
};

function friendlyMessage(status: number, apiMessage: string | undefined): string {
  switch (status) {
    case 401:
    case 403:
      return "Неверный Client ID или API Key, проверьте ключи в настройках";
    case 404:
      return "Метод Ozon API не найден";
    case 429:
      return "Ozon API ограничил частоту запросов, попробуйте чуть позже";
    default:
      if (status >= 500) return "Ozon API временно недоступен, попробуйте позже";
      return apiMessage
        ? `Ozon API: ${apiMessage}`
        : "Не удалось выполнить запрос к Ozon API";
  }
}

/** Все методы Seller API — POST с заголовками Client-Id и Api-Key. Только для сервера. */
export async function ozonRequest<TResponse, TBody = Record<string, unknown>>(params: {
  endpoint: string;
  body: TBody;
  credentials: OzonCredentials;
}): Promise<TResponse> {
  const { endpoint, body, credentials } = params;

  let res: Response;
  try {
    res = await fetch(`${OZON_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Client-Id": credentials.clientId,
        "Api-Key": credentials.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new OzonApiError("Нет соединения с Ozon API, проверьте сеть", 0);
  }

  const json = (await res.json().catch(() => null)) as
    | { message?: string; code?: number }
    | null;

  if (!res.ok) {
    // Технические детали — только в серверный лог
    console.error(`Ozon API ${endpoint} → ${res.status}`, json?.message);
    throw new OzonApiError(friendlyMessage(res.status, json?.message), res.status);
  }

  return json as TResponse;
}
