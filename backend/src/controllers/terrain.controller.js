import { prisma } from '../prisma/client.js';

export async function listTerrains(req, res) {
  const city = req.query.city || req.user.profile?.city;
  const terrains = await prisma.terrain.findMany({
    where: { city },
    include: { availableHours: { where: { startsAt: { gte: new Date() }, isBooked: false }, orderBy: { startsAt: 'asc' }, take: 8 } },
    orderBy: [{ rating: 'desc' }, { pricePerHour: 'asc' }]
  });

  res.json({ terrains });
}
