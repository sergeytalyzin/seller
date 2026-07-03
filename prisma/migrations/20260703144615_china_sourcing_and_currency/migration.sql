-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "agentCommissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currencyMarkupPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "logisticsRatePerKgUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "manualCnyRate" DOUBLE PRECISION,
ADD COLUMN     "manualUsdRate" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSourcing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "link1688" TEXT,
    "agentComment" TEXT,
    "priceCny" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weightKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitsPerBox" INTEGER NOT NULL DEFAULT 1,
    "chinaLogisticsPerBoxCny" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packagingPerBoxUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rfLogisticsPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoCost" BOOLEAN NOT NULL DEFAULT false,
    "qtyPurchasing" INTEGER NOT NULL DEFAULT 0,
    "qtyInTransit" INTEGER NOT NULL DEFAULT 0,
    "qtyOwnWarehouse" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSourcing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CurrencyRate_currency_date_idx" ON "CurrencyRate"("currency", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_date_currency_key" ON "CurrencyRate"("date", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSourcing_productId_key" ON "ProductSourcing"("productId");

-- AddForeignKey
ALTER TABLE "ProductSourcing" ADD CONSTRAINT "ProductSourcing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
