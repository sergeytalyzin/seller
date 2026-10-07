import "server-only";

/**
 * Отправка сообщения через Telegram Bot API. Бот один на приложение,
 * токен — в env TELEGRAM_BOT_TOKEN (создаётся через @BotFather).
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменных окружения");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  const body = (await res.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!res.ok || !body?.ok) {
    throw new Error(
      `Telegram API: ${body?.description ?? `HTTP ${res.status}`}`,
    );
  }
}
