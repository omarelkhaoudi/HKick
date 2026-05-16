-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('INTERNAL', 'PAYZONE');

-- AlterTable
ALTER TABLE "MatchDeposit"
ADD COLUMN "provider" "PaymentProvider" NOT NULL DEFAULT 'INTERNAL',
ADD COLUMN "providerPaymentId" TEXT,
ADD COLUMN "providerToken" TEXT,
ADD COLUMN "checkoutUrl" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MatchDeposit_provider_providerPaymentId_idx" ON "MatchDeposit"("provider", "providerPaymentId");

-- CreateIndex
CREATE INDEX "MatchDeposit_providerToken_idx" ON "MatchDeposit"("providerToken");
