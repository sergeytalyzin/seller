import "server-only";

import type { Store, User } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/supabase/server";

const DEFAULT_STORE_NAME = "Мой магазин";

/**
 * Текущий пользователь приложения и его магазин.
 * Создаёт запись User по email из Supabase-сессии и магазин по умолчанию
 * при первом входе. Возвращает null, если сессии нет.
 */
export async function getUserStore(): Promise<
  { user: User; store: Store } | null
> {
  const authUser = await getAuthUser();
  if (!authUser?.email) return null;

  const user = await db.user.upsert({
    where: { email: authUser.email },
    update: {},
    create: { email: authUser.email },
  });

  const store =
    (await db.store.findFirst({ where: { userId: user.id } })) ??
    (await db.store.create({
      data: { userId: user.id, name: DEFAULT_STORE_NAME },
    }));

  return { user, store };
}
