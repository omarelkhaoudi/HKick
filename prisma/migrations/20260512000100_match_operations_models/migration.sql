-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'CHECKED_IN', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "MatchDepositStatus" AS ENUM ('PENDING', 'RESERVED', 'CAPTURED', 'REFUNDED', 'FORFEITED');

-- CreateTable
CREATE TABLE "MatchConfirmation" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchDeposit" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletTransactionId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "MatchDepositStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3),
    "reservedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "teamVoltScore" INTEGER NOT NULL,
    "teamPulseScore" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchReview" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchConfirmation_matchId_userId_key" ON "MatchConfirmation"("matchId", "userId");

-- CreateIndex
CREATE INDEX "MatchConfirmation_matchId_status_idx" ON "MatchConfirmation"("matchId", "status");

-- CreateIndex
CREATE INDEX "MatchConfirmation_userId_status_idx" ON "MatchConfirmation"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchDeposit_walletTransactionId_key" ON "MatchDeposit"("walletTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchDeposit_matchId_userId_key" ON "MatchDeposit"("matchId", "userId");

-- CreateIndex
CREATE INDEX "MatchDeposit_matchId_status_idx" ON "MatchDeposit"("matchId", "status");

-- CreateIndex
CREATE INDEX "MatchDeposit_userId_status_idx" ON "MatchDeposit"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchResult_matchId_key" ON "MatchResult"("matchId");

-- CreateIndex
CREATE INDEX "MatchResult_submittedById_submittedAt_idx" ON "MatchResult"("submittedById", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchReview_matchId_authorId_subjectId_key" ON "MatchReview"("matchId", "authorId", "subjectId");

-- CreateIndex
CREATE INDEX "MatchReview_subjectId_createdAt_idx" ON "MatchReview"("subjectId", "createdAt");

-- CreateIndex
CREATE INDEX "MatchReview_matchId_rating_idx" ON "MatchReview"("matchId", "rating");

-- AddForeignKey
ALTER TABLE "MatchConfirmation" ADD CONSTRAINT "MatchConfirmation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchConfirmation" ADD CONSTRAINT "MatchConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchDeposit" ADD CONSTRAINT "MatchDeposit_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchDeposit" ADD CONSTRAINT "MatchDeposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchDeposit" ADD CONSTRAINT "MatchDeposit_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReview" ADD CONSTRAINT "MatchReview_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReview" ADD CONSTRAINT "MatchReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchReview" ADD CONSTRAINT "MatchReview_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
