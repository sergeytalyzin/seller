-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OzonSettings" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OzonSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "ozonProductId" TEXT,
    "offerId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "price" DOUBLE PRECISION,
    "oldPrice" DOUBLE PRECISION,
    "currency" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCost" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packagingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceOperation" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "storeId" TEXT NOT NULL,
    "ozonOperationId" TEXT NOT NULL,
    "operationDate" TIMESTAMP(3) NOT NULL,
    "operationType" TEXT NOT NULL,
    "operationTypeName" TEXT,
    "sku" TEXT,
    "offerId" TEXT,
    "productName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "logistics" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acquiring" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OzonSettings_storeId_key" ON "OzonSettings"("storeId");

-- CreateIndex
CREATE INDEX "Product_storeId_sku_idx" ON "Product"("storeId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_offerId_key" ON "Product"("storeId", "offerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCost_productId_key" ON "ProductCost"("productId");

-- CreateIndex
CREATE INDEX "FinanceOperation_storeId_operationDate_idx" ON "FinanceOperation"("storeId", "operationDate");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceOperation_storeId_ozonOperationId_key" ON "FinanceOperation"("storeId", "ozonOperationId");

-- CreateIndex
CREATE INDEX "Expense_storeId_date_idx" ON "Expense"("storeId", "date");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OzonSettings" ADD CONSTRAINT "OzonSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCost" ADD CONSTRAINT "ProductCost_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceOperation" ADD CONSTRAINT "FinanceOperation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceOperation" ADD CONSTRAINT "FinanceOperation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
