-- CreateTable
CREATE TABLE "FboPosting" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "postingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL,
    "inProcessAt" TIMESTAMP(3),
    "productId" TEXT,
    "sku" TEXT,
    "offerId" TEXT,
    "productName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FboPosting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FboPosting_storeId_orderedAt_idx" ON "FboPosting"("storeId", "orderedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FboPosting_storeId_postingNumber_sku_key" ON "FboPosting"("storeId", "postingNumber", "sku");

-- AddForeignKey
ALTER TABLE "FboPosting" ADD CONSTRAINT "FboPosting_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FboPosting" ADD CONSTRAINT "FboPosting_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
