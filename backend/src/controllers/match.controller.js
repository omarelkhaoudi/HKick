import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { balanceTeams } from '../services/teamBalancer.js';
import { presentMatch } from '../services/matchPresenter.js';
import { createNotification } from '../services/notifications.js';

const createMatchSchema = z.object({
  title: z.string().min(3),
  city: z.string().min(2),
  startsAt: z.string().datetime(),
  maxPlayers: z.number().int().min(4).max(22).default(10),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  terrainId: z.string().optional().nullable()
});

const confirmationSchema = z.object({
  userId: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DECLINED', 'CHECKED_IN', 'NO_SHOW']),
  note: z.string().max(240).optional().nullable()
});

const depositSchema = z.object({
  userId: z.string().optional(),
  amount: z.number().positive().max(10000),
  status: z.enum(['PENDING', 'RESERVED', 'CAPTURED', 'REFUNDED', 'FORFEITED']).default('RESERVED')
});

const resultSchema = z.object({
  teamVoltScore: z.number().int().min(0).max(99),
  teamPulseScore: z.number().int().min(0).max(99),
  isFinal: z.boolean().default(false)
});

const reviewSchema = z.object({
  subjectId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().min(1).max(32)).max(8).default([])
});

export async function listMatches(req, res) {
  const city = req.query.city || req.user.profile?.city;
  const matches = await prisma.match.findMany({
    where: {
      city,
      status: { in: ['OPEN', 'FULL', 'LIVE'] },
      OR: [{ visibility: 'PUBLIC' }, { players: { some: { userId: req.user.id } } }]
    },
    include: matchInclude,
    orderBy: { startsAt: 'asc' },
    take: 50
  });

  res.json({ matches: matches.map(presentMatch) });
}

export async function getMatchmaking(req, res) {
  const recommendations = await buildRecommendations(req.user);
  res.json({ recommendations });
}

export async function instantMatch(req, res) {
  const [best] = await buildRecommendations(req.user);

  if (!best) {
    return res.status(404).json({
      message: 'No open match fits right now',
      fallback: {
        action: 'CREATE_MATCH',
        title: `Quick ${req.user.profile?.city || 'city'} match`,
        reason: 'No available public match has enough fit or open spots.'
      }
    });
  }

  await prisma.matchPlayer.upsert({
    where: { matchId_userId: { matchId: best.match.id, userId: req.user.id } },
    update: {},
    create: { matchId: best.match.id, userId: req.user.id }
  });

  const updated = await rebalanceMatch(best.match.id);
  req.io.to(`match:${updated.id}`).emit('match:updated', presentMatch(updated));
  req.io.to(`city:${updated.city}`).emit('match:updated', presentMatch(updated));

  res.json({
    match: presentMatch(updated),
    score: best.score,
    reasons: best.reasons
  });
}

export async function createMatch(req, res) {
  const input = createMatchSchema.parse(req.body);
  const inviteCode = input.visibility === 'PRIVATE' ? cryptoRandomCode() : null;

  const match = await prisma.match.create({
    data: {
      ...input,
      startsAt: new Date(input.startsAt),
      inviteCode,
      ownerId: req.user.id,
      players: { create: { userId: req.user.id } }
    },
    include: matchInclude
  });

  req.io.to(`city:${match.city}`).emit('match:created', presentMatch(match));
  res.status(201).json({ match: presentMatch(match) });
}

export async function getMatch(req, res) {
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
    include: { ...matchInclude, messages: { include: { user: { include: { profile: true } } }, orderBy: { createdAt: 'asc' } } }
  });

  if (!match) return res.status(404).json({ message: 'Match not found' });
  res.json({ match: presentMatch(match) });
}

export async function joinMatch(req, res) {
  const match = await prisma.match.findUnique({ where: { id: req.params.id }, include: matchInclude });
  if (!match) return res.status(404).json({ message: 'Match not found' });
  if (match.players.length >= match.maxPlayers) return res.status(409).json({ message: 'Match is already full' });

  await prisma.matchPlayer.upsert({
    where: { matchId_userId: { matchId: match.id, userId: req.user.id } },
    update: {},
    create: { matchId: match.id, userId: req.user.id }
  });

  const updated = await rebalanceMatch(match.id);
  await createNotification(req.io, req.user.id, {
    type: 'MATCH',
    title: 'Spot reserved',
    body: `You joined ${updated.title}. Teams were rebalanced.`
  });
  req.io.to(`match:${match.id}`).emit('match:updated', presentMatch(updated));
  req.io.to(`city:${match.city}`).emit('match:updated', presentMatch(updated));
  res.json({ match: presentMatch(updated) });
}

export async function leaveMatch(req, res) {
  const match = await prisma.match.findUnique({ where: { id: req.params.id } });
  if (!match) return res.status(404).json({ message: 'Match not found' });

  await prisma.matchPlayer.deleteMany({ where: { matchId: match.id, userId: req.user.id } });
  const updated = await rebalanceMatch(match.id);
  req.io.to(`match:${match.id}`).emit('match:updated', presentMatch(updated));
  req.io.to(`city:${match.city}`).emit('match:updated', presentMatch(updated));
  res.json({ match: presentMatch(updated) });
}

export async function sendMessage(req, res) {
  const body = z.object({ body: z.string().min(1).max(500) }).parse(req.body).body;
  const message = await prisma.matchMessage.create({
    data: { matchId: req.params.id, userId: req.user.id, body },
    include: { user: { include: { profile: true } } }
  });

  req.io.to(`match:${req.params.id}`).emit('chat:message', message);
  res.status(201).json({ message });
}

export async function upsertConfirmation(req, res) {
  const input = confirmationSchema.parse(req.body);
  const targetUserId = input.userId || req.user.id;
  await assertCanManageMatchUser(req.params.id, req.user.id, targetUserId);

  const now = new Date();
  const confirmation = await prisma.matchConfirmation.upsert({
    where: { matchId_userId: { matchId: req.params.id, userId: targetUserId } },
    update: {
      status: input.status,
      note: input.note,
      confirmedAt: ['CONFIRMED', 'CHECKED_IN'].includes(input.status) ? now : null,
      checkedInAt: input.status === 'CHECKED_IN' ? now : null
    },
    create: {
      matchId: req.params.id,
      userId: targetUserId,
      status: input.status,
      note: input.note,
      confirmedAt: ['CONFIRMED', 'CHECKED_IN'].includes(input.status) ? now : null,
      checkedInAt: input.status === 'CHECKED_IN' ? now : null
    }
  });

  req.io.to(`match:${req.params.id}`).emit('match:confirmation', confirmation);
  res.json({ confirmation });
}

export async function reserveDeposit(req, res) {
  const input = depositSchema.parse(req.body);
  const targetUserId = input.userId || req.user.id;
  await assertCanManageMatchUser(req.params.id, req.user.id, targetUserId);

  const deposit = await prisma.$transaction(async (tx) => {
    let transaction = null;

    if (['RESERVED', 'CAPTURED'].includes(input.status)) {
      transaction = await tx.walletTransaction.create({
        data: {
          userId: targetUserId,
          type: 'DEBIT',
          label: 'Match deposit',
          amount: input.amount,
          status: input.status
        }
      });
    }

    return tx.matchDeposit.upsert({
      where: { matchId_userId: { matchId: req.params.id, userId: targetUserId } },
      update: {
        amount: input.amount,
        status: input.status,
        walletTransactionId: transaction?.id,
        reservedAt: input.status === 'RESERVED' ? new Date() : undefined,
        capturedAt: input.status === 'CAPTURED' ? new Date() : undefined,
        refundedAt: input.status === 'REFUNDED' ? new Date() : undefined
      },
      create: {
        matchId: req.params.id,
        userId: targetUserId,
        amount: input.amount,
        status: input.status,
        walletTransactionId: transaction?.id,
        reservedAt: input.status === 'RESERVED' ? new Date() : null,
        capturedAt: input.status === 'CAPTURED' ? new Date() : null,
        refundedAt: input.status === 'REFUNDED' ? new Date() : null
      }
    });
  });

  await createNotification(req.io, targetUserId, {
    type: 'WALLET',
    title: 'Match deposit updated',
    body: `MAD ${Number(deposit.amount)} deposit is ${deposit.status.toLowerCase()}.`
  });

  req.io.to(`match:${req.params.id}`).emit('match:deposit', deposit);
  res.status(201).json({ deposit });
}

export async function upsertResult(req, res) {
  const input = resultSchema.parse(req.body);
  await assertMatchParticipant(req.params.id, req.user.id);

  const result = await prisma.matchResult.upsert({
    where: { matchId: req.params.id },
    update: { ...input, submittedById: req.user.id },
    create: { ...input, matchId: req.params.id, submittedById: req.user.id }
  });

  if (input.isFinal) {
    await prisma.match.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } });
  }

  req.io.to(`match:${req.params.id}`).emit('match:result', result);
  res.json({ result });
}

export async function createReview(req, res) {
  const input = reviewSchema.parse(req.body);
  await assertMatchParticipant(req.params.id, req.user.id);
  await assertMatchParticipant(req.params.id, input.subjectId);

  if (input.subjectId === req.user.id) {
    return res.status(400).json({ message: 'You cannot review yourself' });
  }

  const review = await prisma.matchReview.upsert({
    where: {
      matchId_authorId_subjectId: {
        matchId: req.params.id,
        authorId: req.user.id,
        subjectId: input.subjectId
      }
    },
    update: {
      rating: input.rating,
      comment: input.comment,
      tags: input.tags
    },
    create: {
      matchId: req.params.id,
      authorId: req.user.id,
      subjectId: input.subjectId,
      rating: input.rating,
      comment: input.comment,
      tags: input.tags
    }
  });

  res.status(201).json({ review });
}

async function assertMatchParticipant(matchId, userId) {
  const participant = await prisma.matchPlayer.findUnique({
    where: { matchId_userId: { matchId, userId } }
  });

  if (!participant) {
    const error = new Error('Only match participants can perform this action');
    error.statusCode = 403;
    throw error;
  }
}

async function assertCanManageMatchUser(matchId, actorId, targetUserId) {
  await assertMatchParticipant(matchId, targetUserId);

  if (actorId === targetUserId) return;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { ownerId: true }
  });

  if (match?.ownerId !== actorId) {
    const error = new Error('Only the match owner can manage another player');
    error.statusCode = 403;
    throw error;
  }
}

async function rebalanceMatch(matchId) {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: matchInclude });
  const teams = balanceTeams(match.players);

  await Promise.all(
    teams.flatMap((team) =>
      team.players.map((userId) =>
        prisma.matchPlayer.update({
          where: { matchId_userId: { matchId, userId } },
          data: { team: team.name }
        })
      )
    )
  );

  const playersCount = match.players.length;
  const status = playersCount >= match.maxPlayers ? 'FULL' : 'OPEN';
  return prisma.match.update({ where: { id: matchId }, data: { status }, include: matchInclude });
}

async function buildRecommendations(user) {
  const profile = user.profile;
  const city = profile?.city;
  const skillLevel = profile?.skillLevel ?? 3;
  const preferredPosition = profile?.preferredPosition ?? 'FLEX';
  const now = new Date();

  const matches = await prisma.match.findMany({
    where: {
      city,
      status: 'OPEN',
      visibility: 'PUBLIC',
      startsAt: { gte: now },
      players: { none: { userId: user.id } }
    },
    include: matchInclude,
    orderBy: { startsAt: 'asc' },
    take: 40
  });

  return matches
    .filter((match) => match.players.length < match.maxPlayers)
    .map((match) => scoreMatch(match, { skillLevel, preferredPosition }))
    .filter((recommendation) => recommendation.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function scoreMatch(match, player) {
  const playersCount = match.players.length;
  const spotsLeft = match.maxPlayers - playersCount;
  const fillRate = playersCount / match.maxPlayers;
  const averageSkill = averageSkillLevel(match.players);
  const skillDiff = Math.abs((averageSkill || player.skillLevel) - player.skillLevel);
  const hoursUntilKickoff = Math.max(0, (new Date(match.startsAt).getTime() - Date.now()) / 36e5);
  const positionCount = match.players.filter((item) => item.user.profile?.preferredPosition === player.preferredPosition).length;

  let score = 35;
  const reasons = [];

  if (spotsLeft > 0) {
    score += Math.min(20, spotsLeft * 4);
    reasons.push(`${spotsLeft} open spot${spotsLeft === 1 ? '' : 's'}`);
  }

  if (skillDiff <= 0.75) {
    score += 22;
    reasons.push('strong skill fit');
  } else if (skillDiff <= 1.5) {
    score += 12;
    reasons.push('playable skill fit');
  } else {
    score -= 8;
    reasons.push('skill stretch');
  }

  if (hoursUntilKickoff <= 2) {
    score += 18;
    reasons.push('starts soon');
  } else if (hoursUntilKickoff <= 6) {
    score += 10;
    reasons.push('tonight');
  }

  if (fillRate >= 0.65 && fillRate < 1) {
    score += 14;
    reasons.push('fast fill');
  }

  if (player.preferredPosition !== 'FLEX' && positionCount <= 1) {
    score += 10;
    reasons.push(`${player.preferredPosition} needed`);
  }

  if (match.terrainId) {
    score += 6;
    reasons.push('pitch linked');
  }

  return {
    match: presentMatch(match),
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons,
    fit: {
      spotsLeft,
      fillRate: Number((fillRate * 100).toFixed(0)),
      averageSkill,
      skillDiff: Number(skillDiff.toFixed(1)),
      hoursUntilKickoff: Number(hoursUntilKickoff.toFixed(1))
    }
  };
}

function averageSkillLevel(players) {
  if (!players.length) return 0;
  const total = players.reduce((sum, player) => sum + (player.user.profile?.skillLevel ?? 1), 0);
  return Number((total / players.length).toFixed(1));
}

const matchInclude = {
  terrain: true,
  owner: { include: { profile: true } },
  players: {
    include: { user: { include: { profile: true } } },
    orderBy: { joinedAt: 'asc' }
  },
  confirmations: true,
  deposits: true,
  result: true,
  reviews: true
};

function cryptoRandomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
