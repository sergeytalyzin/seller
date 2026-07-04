import type { Metadata } from "next";
import { ProductDetail } from "@/components/products/product-detail";

export const metadata: Metadata = { title: "Карточка товара" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
