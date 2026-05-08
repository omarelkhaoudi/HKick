import { prisma } from '../prisma/client.js';

export async function createNotification(io, userId, payload) {
  let notification;
  try {
    notification = await prisma.notification.create({
      data: {
        userId,
        type: payload.type || 'SYSTEM',
        title: payload.title,
        body: payload.body
      }
    });
  } catch (error) {
    if (error?.code !== 'P2021' && error?.code !== 'P2022') throw error;
    notification = {
      id: `runtime-${Date.now()}`,
      userId,
      type: payload.type || 'SYSTEM',
      title: payload.title,
      body: payload.body,
      read: false,
      createdAt: new Date()
    };
  }

  io?.to(`user:${userId}`).emit('notification:created', notification);
  return notification;
}
