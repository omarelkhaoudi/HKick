import { prisma } from '../prisma/client.js';
import { presentMatch } from '../services/matchPresenter.js';

export async function getOpsSummary(req, res) {
  const city = req.query.city || req.user.profile?.city;
  const today = new Date();
  const startsAt = startOfDay(today);
  const endsAt = endOfDay(today);

  const [matches, bookings, terrains] = await Promise.all([
    prisma.match.findMany({
      where: {
        city,
        startsAt: { gte: startsAt, lte: endsAt },
        status: { in: ['OPEN', 'FULL', 'LIVE', 'COMPLETED'] }
      },
      include: {
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
      },
      orderBy: { startsAt: 'asc' },
      take: 30
    }),
    prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startsAt: { gte: startsAt, lte: endsAt },
        ...(city ? { terrain: { city } } : {})
      },
      include: { terrain: true, match: true },
      orderBy: { startsAt: 'asc' },
      take: 30
    }),
    prisma.terrain.findMany({
      where: city ? { city } : undefined,
      include: {
        availableHours: {
          where: { startsAt: { gte: startsAt, lte: endsAt } }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  const presentedMatches = matches.map(presentMatch);
  const activeMatches = presentedMatches.filter((match) => ['OPEN', 'FULL', 'LIVE'].includes(match.status));
  const bookedSlots = bookings.length;
  const totalSlots = terrains.reduce((sum, terrain) => sum + terrain.availableHours.length, 0) + bookedSlots;
  const revenue = bookings.reduce((sum, booking) => sum + Number(booking.terrain.pricePerHour || 0), 0);
  const averageFill = activeMatches.length
    ? Math.round(activeMatches.reduce((sum, match) => sum + ((match.playersCount || 0) / match.maxPlayers), 0) * 100 / activeMatches.length)
    : 0;

  const riskMatches = presentedMatches
    .map((match) => ({
      ...match,
      risk: getMatchRisk(match)
    }))
    .filter((match) => match.risk.score > 0);

  res.json({
    metrics: {
      revenue,
      utilization: totalSlots ? Math.round((bookedSlots / totalSlots) * 100) : 0,
      averageFill,
      riskCount: riskMatches.length,
      bookedSlots,
      totalSlots
    },
    matches: presentedMatches,
    riskMatches,
    bookings: bookings.map(presentBooking),
    generatedAt: new Date().toISOString()
  });
}

function presentBooking(booking) {
  return {
    id: booking.id,
    terrainName: booking.terrain.name,
    terrainId: booking.terrainId,
    matchId: booking.matchId,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    status: booking.status,
    pricePerHour: Number(booking.terrain.pricePerHour),
    city: booking.terrain.city
  };
}

function getMatchRisk(match) {
  const players = match.players || [];
  const confirmations = match.confirmations || [];
  const deposits = match.deposits || [];
  const spotsLeft = Math.max(0, match.maxPlayers - match.playersCount);
  const missingConfirmations = players.filter((player) => !confirmations.find((item) => item.userId === player.userId && ['CONFIRMED', 'CHECKED_IN'].includes(item.status))).length;
  const missingDeposits = players.filter((player) => !deposits.find((item) => item.userId === player.userId && ['RESERVED', 'CAPTURED'].includes(item.status))).length;

  const score = spotsLeft >= 3 ? 2 : 0;
  const confirmationScore = missingConfirmations >= 2 ? 2 : missingConfirmations;
  const depositScore = missingDeposits >= 2 ? 1 : 0;

  return {
    score: score + confirmationScore + depositScore,
    spotsLeft,
    missingConfirmations,
    missingDeposits
  };
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}
