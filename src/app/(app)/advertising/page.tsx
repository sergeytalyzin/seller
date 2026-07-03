import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Реклама" };

export default function AdvertisingPage() {
  return (
    <PagePlaceholder
      title="Реклама"
      description="Расходы на продвижение, ДРР и стоимость заказа по каждому товару."
      icon={Megaphone}
      stage="Здесь появится статистика рекламных кампаний из Ozon Performance API: расходы по SKU и дням, ДРР (в том числе с учётом процента выкупа) и стоимость получения одного заказа. Подключение рекламного кабинета — следующий этап; пока расходы на продвижение, списанные с баланса Seller API, уже учитываются в чистой прибыли в категории «Продвижение»."
    />
  );
}
