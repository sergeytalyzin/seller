/**
 * Dev-скрипт: сохраняет ключи Ozon для первого магазина и запускает полную
 * синхронизацию. Использование: npx tsx scripts/dev-sync.ts <clientId> <apiKey>
 */
import { db } from "../src/lib/db";
import { syncAll } from "../src/server/services/sync-service";

async function main() {
  const [clientId, apiKey] = process.argv.slice(2);
  if (!clientId || !apiKey) {
    throw new Error("Использование: npx tsx scripts/dev-sync.ts <clientId> <apiKey>");
  }

  const store = await db.store.findFirst({ orderBy: { createdAt: "asc" } });
  if (!store) {
    throw new Error("Магазин не найден — сначала войдите в приложение");
  }
  console.log("Магазин:", store.name, store.id);

  await db.ozonSettings.upsert({
    where: { storeId: store.id },
    update: { clientId, apiKey },
    create: { storeId: store.id, clientId, apiKey },
  });
  console.log("Ключи сохранены");

  const dateTo = new Date();
  const dateFrom = new Date(dateTo.getTime() - 90 * 24 * 60 * 60 * 1000);
  const result = await syncAll(store.id, dateFrom, dateTo);
  console.log("Результат:", result);

  const [products, operations] = await Promise.all([
    db.product.count({ where: { storeId: store.id } }),
    db.financeOperation.count({ where: { storeId: store.id } }),
  ]);
  console.log(`В базе: товаров ${products}, операций ${operations}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
