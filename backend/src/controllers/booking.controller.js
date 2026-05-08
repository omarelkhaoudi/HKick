import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { createNotification } from '../services/notifications.js';

const bookingSchema = z.object({
  terrainId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  matchId: z.string().optional().nullable()
});

export async function createBooking(req, res) {
  const input = bookingSchema.parse(req.body);
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  const conflict = await prisma.booking.findFirst({
    where: {
      terrainId: input.terrainId,
      status: 'CONFIRMED',
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt }
    }
  });

  if (conflict) return res.status(409).json({ message: 'Terrain is already booked for this slot' });

  const booking = await prisma.booking.create({
    data: { ...input, startsAt, endsAt, userId: req.user.id },
    include: { terrain: true, match: true }
  });

  await createNotification(req.io, req.user.id, {
    type: 'BOOKING',
    title: 'Pitch reserved',
    body: `${booking.terrain.name} is confirmed for ${startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
  });

  req.io.to(`city:${booking.terrain.city}`).emit('booking:created', booking);
  res.status(201).json({ booking });
}
