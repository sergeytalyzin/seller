import type { Metadata } from "next";
import { ProductDetail } from "@/components/products/product-detail";

export const metadata: Metadata = { title: "Карточка товара" };

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { id } = await params;
  // Период из ссылки со страницы /products — чтобы фильтр не терялся
  const { period, from, to } = await searchParams;
  return (
    <ProductDetail
      productId={id}
      initialPeriodKey={period}
      initialCustom={from && to ? { from, to } : undefined}
    />
  );
}
