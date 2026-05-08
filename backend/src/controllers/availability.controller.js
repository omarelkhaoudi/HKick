import { prisma } from '../prisma/client.js';

export async function nearbyPlayers(req, res) {
  const city = req.query.city || req.user.profile?.city;
  const players = await prisma.playerProfile.findMany({
    where: {
      city,
      isAvailable: true,
      userId: { not: req.user.id }
    },
    orderBy: { lastSeenAt: 'desc' },
    take: 30
  });

  res.json({ players });
}

export async function setAvailability(req, res) {
  const profile = await prisma.playerProfile.update({
    where: { userId: req.user.id },
    data: { isAvailable: Boolean(req.body.isAvailable), lastSeenAt: new Date() }
  });

  req.app.get('io')?.to(`city:${profile.city}`).emit('availability:updated', profile);
  res.json({ profile });
}
