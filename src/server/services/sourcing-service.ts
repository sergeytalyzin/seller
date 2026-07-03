import "server-only";

import {
  applyCurrencyMarkup,
  calcSourcingCost,
  type SourcingRates,
} from "@/lib/analytics/sourcing";
import { getCurrencyRates } from "@/server/currency";
import { getDataStore } from "@/server/data";
import { db } from "@/lib/db";
import type { StoreSettings } from "@/types/settings";

export type EffectiveRates = {
  /** ₽ за 1 ¥ с учётом надбавки/ручного курса */
  cnyRate: number;
  /** ₽ за 1 $ с учётом надбавки/ручного курса */
  usdRate: number;
  /** Официальные курсы ЦБ без надбавки (для справки в UI) */
  cbrCnyRate: number | null;
  cbrUsdRate: number | null;
  /** true — используются ручные курсы из настроек */
  manual: boolean;
};

/**
 * Действующие курсы для расчёта закупки: ручные из настроек,
 * иначе курс ЦБ × (1 + надбавка). null — курсов нет совсем.
 */
export async function getEffectiveRates(
  settings: StoreSettings,
): Promise<EffectiveRates | null> {
  const cbr = await getCurrencyRates();

  if (settings.manualCnyRate != null && settings.manualUsdRate != null) {
    return {
      cnyRate: settings.manualCnyRate,
      usdRate: settings.manualUsdRate,
      cbrCnyRate: cbr?.cnyRate ?? null,
      cbrUsdRate: cbr?.usdRate ?? null,
      manual: true,
    };
  }

  if (!cbr) return null;
  return {
    cnyRate: applyCurrencyMarkup(cbr.cnyRate, settings.currencyMarkupPercent),
    usdRate: applyCurrencyMarkup(cbr.usdRate, settings.currencyMarkupPercent),
    cbrCnyRate: cbr.cnyRate,
    cbrUsdRate: cbr.usdRate,
    manual: false,
  };
}

/**
 * Пересчёт поля «Закупка» себестоимости для товаров с автоматическим
 * расчётом из параметров закупки. Вызывается при сохранении параметров,
 * настроек магазина и при каждой синхронизации (курс мог измениться).
 */
export async function recalcAutoSourcingCosts(storeId: string): Promise<number> {
  const store = getDataStore(storeId);
  const settings = await store.getStoreSettings();
  const rates = await getEffectiveRates(settings);
  if (!rates) return 0;

  const sourcingRates: SourcingRates = {
    cnyRate: rates.cnyRate,
    usdRate: rates.usdRate,
    agentCommissionPercent: settings.agentCommissionPercent,
    logisticsRatePerKgUsd: settings.logisticsRatePerKgUsd,
  };

  const sourcings = await store.listProductSourcing();
  let updated = 0;

  for (const sourcing of sourcings) {
    if (!sourcing.autoCost || sourcing.priceCny <= 0) continue;
    const breakdown = calcSourcingCost(sourcing, sourcingRates);
    const purchaseCost = Math.round(breakdown.total * 100) / 100;

    await db.productCost.upsert({
      where: { productId: sourcing.productId },
      update: { purchaseCost },
      create: {
        productId: sourcing.productId,
        purchaseCost,
        packagingCost: 0,
        deliveryCost: 0,
        taxPercent: 0,
        otherCost: 0,
      },
    });
    updated += 1;
  }

  return updated;
}
