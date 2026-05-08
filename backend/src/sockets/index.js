import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';

export function registerSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing token'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true }
      });

      if (!user) return next(new Error('Invalid user'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const city = socket.user.profile?.city;
    if (city) socket.join(`city:${city}`);
    socket.join(`user:${socket.user.id}`);

    socket.on('availability:online', async () => {
      const profile = await prisma.playerProfile.update({
        where: { userId: socket.user.id },
        data: { isAvailable: true, lastSeenAt: new Date() }
      });
      io.to(`city:${profile.city}`).emit('availability:updated', profile);
    });

    socket.on('match:join-room', (matchId) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('match:leave-room', (matchId) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on('disconnect', async () => {
      if (!socket.user?.id) return;
      const profile = await prisma.playerProfile.update({
        where: { userId: socket.user.id },
        data: { isAvailable: false, lastSeenAt: new Date() }
      });
      io.to(`city:${profile.city}`).emit('availability:updated', profile);
    });
  });
}
