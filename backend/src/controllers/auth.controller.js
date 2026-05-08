import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { signToken } from '../services/tokens.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  age: z.number().int().min(13).max(80),
  city: z.string().min(2),
  preferredPosition: z.enum(['GK', 'DEF', 'MID', 'FWD', 'FLEX']).default('FLEX'),
  skillLevel: z.number().int().min(1).max(5),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req, res) {
  const input = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      profile: {
        create: {
          name: input.name,
          age: input.age,
          city: input.city,
          preferredPosition: input.preferredPosition,
          skillLevel: input.skillLevel,
          avatarUrl: input.avatarUrl || null
        }
      }
    },
    include: { profile: true }
  });

  res.status(201).json({ token: signToken(user.id), user: withoutPassword(user) });
}

export async function login(req, res) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { profile: true }
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: signToken(user.id), user: withoutPassword(user) });
}

export function me(req, res) {
  res.json({ user: withoutPassword(req.user) });
}

function withoutPassword(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}
