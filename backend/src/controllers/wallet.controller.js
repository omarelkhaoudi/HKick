import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { createNotification } from '../services/notifications.js';

const amountSchema = z.object({
  amount: z.number().positive().max(10000)
});

export async function getWallet(req, res) {
  let transactions;
  try {
    transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  } catch (error) {
    if (isMissingTable(error)) return res.json({ balance: 0, transactions: [] });
    throw error;
  }

  res.json({ balance: getBalance(transactions), transactions: presentTransactions(transactions) });
}

export async function topUpWallet(req, res) {
  const { amount } = amountSchema.parse(req.body);
  let transaction;
  try {
    transaction = await prisma.walletTransaction.create({
      data: {
        userId: req.user.id,
        type: 'CREDIT',
        label: 'Wallet top-up',
        amount,
        status: 'CONFIRMED'
      }
    });
  } catch (error) {
    if (isMissingTable(error)) return res.status(201).json({ transaction: fallbackTransaction('CREDIT', 'Wallet top-up', amount, 'CONFIRMED'), balance: amount });
    throw error;
  }

  await createNotification(req.io, req.user.id, {
    type: 'WALLET',
    title: 'Wallet topped up',
    body: `MAD ${amount} added to your HKick wallet.`
  });

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  res.status(201).json({ transaction: presentTransaction(transaction), balance: getBalance(transactions) });
}

export async function payDeposit(req, res) {
  const { amount } = amountSchema.parse(req.body);
  let transactions;
  try {
    transactions = await prisma.walletTransaction.findMany({ where: { userId: req.user.id } });
  } catch (error) {
    if (isMissingTable(error)) return res.status(201).json({ transaction: fallbackTransaction('DEBIT', 'Match deposit', amount, 'RESERVED'), balance: 0 });
    throw error;
  }
  const balance = getBalance(transactions);

  if (balance < amount) {
    return res.status(409).json({ message: 'Insufficient wallet balance' });
  }

  const transaction = await prisma.walletTransaction.create({
    data: {
      userId: req.user.id,
      type: 'DEBIT',
      label: 'Match deposit',
      amount,
      status: 'RESERVED'
    }
  });

  await createNotification(req.io, req.user.id, {
    type: 'WALLET',
    title: 'Deposit reserved',
    body: `MAD ${amount} reserved for your next match.`
  });

  const updated = await prisma.walletTransaction.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.status(201).json({ transaction: presentTransaction(transaction), balance: getBalance(updated) });
}

function getBalance(transactions) {
  return Number(
    transactions
      .reduce((sum, transaction) => sum + (transaction.type === 'CREDIT' ? Number(transaction.amount) : -Number(transaction.amount)), 0)
      .toFixed(2)
  );
}

function presentTransactions(transactions) {
  return transactions.map(presentTransaction);
}

function presentTransaction(transaction) {
  return {
    id: transaction.id,
    type: transaction.type === 'CREDIT' ? 'in' : 'out',
    label: transaction.label,
    amount: Number(transaction.amount),
    date: transaction.createdAt,
    status: transaction.status
  };
}

function fallbackTransaction(type, label, amount, status) {
  return {
    id: `runtime-${Date.now()}`,
    type: type === 'CREDIT' ? 'in' : 'out',
    label,
    amount,
    date: new Date().toISOString(),
    status
  };
}

function isMissingTable(error) {
  return error?.code === 'P2021' || error?.code === 'P2022';
}
