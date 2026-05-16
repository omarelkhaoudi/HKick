import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { createNotification } from '../services/notifications.js';
import { getPayzonePaymentStatus, mapPayzoneStatus, preparePayzonePayment } from '../services/payments/payzone.js';

const checkoutSchema = z.object({
  matchId: z.string(),
  amount: z.number().positive().max(10000).default(50)
});

export async function createMatchDepositCheckout(req, res) {
  const input = checkoutSchema.parse(req.body);
  const match = await prisma.match.findUnique({
    where: { id: input.matchId },
    include: {
      players: true,
      terrain: true
    }
  });

  if (!match) return res.status(404).json({ message: 'Match not found' });
  if (!match.players.some((player) => player.userId === req.user.id)) {
    return res.status(403).json({ message: 'Only match participants can pay a deposit' });
  }

  const deposit = await prisma.matchDeposit.upsert({
    where: { matchId_userId: { matchId: match.id, userId: req.user.id } },
    update: {
      amount: input.amount,
      provider: 'PAYZONE',
      status: 'PENDING'
    },
    create: {
      matchId: match.id,
      userId: req.user.id,
      amount: input.amount,
      provider: 'PAYZONE',
      status: 'PENDING'
    }
  });

  const frontendUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  const payment = await preparePayzonePayment({
    deposit,
    match,
    user: req.user,
    returnUrl: `${frontendUrl}/matches/${match.id}?payment=success&deposit=${deposit.id}`,
    cancelUrl: `${frontendUrl}/matches/${match.id}?payment=cancelled&deposit=${deposit.id}`
  });

  const updated = await prisma.matchDeposit.update({
    where: { id: deposit.id },
    data: {
      providerPaymentId: payment.providerPaymentId,
      providerToken: payment.providerToken,
      checkoutUrl: payment.checkoutUrl
    }
  });

  res.status(201).json({ deposit: presentDeposit(updated) });
}

export async function syncMatchDepositPayment(req, res) {
  const deposit = await prisma.matchDeposit.findUnique({
    where: { id: req.params.id },
    include: { match: true }
  });

  if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
  if (deposit.userId !== req.user.id && deposit.match.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'You cannot view this payment' });
  }
  if (deposit.provider !== 'PAYZONE' || !deposit.providerToken) {
    return res.status(400).json({ message: 'Deposit is not linked to a Payzone payment' });
  }

  const status = await getPayzonePaymentStatus(deposit.providerToken);
  const nextStatus = mapPayzoneStatus(status.status);
  const now = new Date();

  const updated = await prisma.matchDeposit.update({
    where: { id: deposit.id },
    data: {
      status: nextStatus,
      reservedAt: nextStatus === 'RESERVED' ? now : deposit.reservedAt,
      paidAt: nextStatus === 'RESERVED' ? now : deposit.paidAt,
      refundedAt: nextStatus === 'REFUNDED' ? now : deposit.refundedAt
    }
  });

  if (nextStatus === 'RESERVED') {
    await createNotification(req.io, deposit.userId, {
      type: 'WALLET',
      title: 'Deposit paid',
      body: `Your MAD ${Number(updated.amount)} match deposit is confirmed.`
    });
  }

  req.io.to(`match:${deposit.matchId}`).emit('match:deposit', updated);
  res.json({ deposit: presentDeposit(updated), providerStatus: status.status });
}

function presentDeposit(deposit) {
  return {
    id: deposit.id,
    matchId: deposit.matchId,
    userId: deposit.userId,
    amount: Number(deposit.amount),
    status: deposit.status,
    provider: deposit.provider,
    checkoutUrl: deposit.checkoutUrl,
    providerPaymentId: deposit.providerPaymentId,
    providerToken: deposit.providerToken,
    paidAt: deposit.paidAt,
    reservedAt: deposit.reservedAt
  };
}
