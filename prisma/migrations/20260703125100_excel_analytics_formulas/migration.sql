-- AlterTable
ALTER TABLE "FinanceOperation" ADD COLUMN     "advertising" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastMile" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "returnLogistics" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "storage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unclassified" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "usnPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vatPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overheadPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusAccrual" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockSnapshot" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,
    "sku" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "transitQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");

-- CreateIndex
CREATE INDEX "BonusAccrual_storeId_date_idx" ON "BonusAccrual"("storeId", "date");

-- CreateIndex
CREATE INDEX "StockSnapshot_storeId_date_idx" ON "StockSnapshot"("storeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StockSnapshot_storeId_sku_date_key" ON "StockSnapshot"("storeId", "sku", "date");

-- AddForeignKey
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusAccrual" ADD CONSTRAINT "BonusAccrual_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockSnapshot" ADD CONSTRAINT "StockSnapshot_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockSnapshot" ADD CONSTRAINT "StockSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
