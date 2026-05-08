import { z } from 'zod';
import { prisma } from '../prisma/client.js';

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  age: z.number().int().min(13).max(80).optional(),
  city: z.string().min(2).optional(),
  preferredPosition: z.enum(['GK', 'DEF', 'MID', 'FWD', 'FLEX']).optional(),
  skillLevel: z.number().int().min(1).max(5).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  isAvailable: z.boolean().optional()
});

export async function updateProfile(req, res) {
  const input = profileSchema.parse(req.body);
  const profile = await prisma.playerProfile.update({
    where: { userId: req.user.id },
    data: { ...input, lastSeenAt: new Date() }
  });

  res.json({ profile });
}
