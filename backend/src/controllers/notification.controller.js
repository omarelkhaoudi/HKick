import { prisma } from '../prisma/client.js';

export async function listNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ notifications });
  } catch (error) {
    if (isMissingTable(error)) return res.json({ notifications: [] });
    throw error;
  }
}

export async function markNotificationsRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    });

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ notifications });
  } catch (error) {
    if (isMissingTable(error)) return res.json({ notifications: [] });
    throw error;
  }
}

export async function clearNotifications(req, res) {
  try {
    await prisma.notification.deleteMany({ where: { userId: req.user.id } });
    res.json({ notifications: [] });
  } catch (error) {
    if (isMissingTable(error)) return res.json({ notifications: [] });
    throw error;
  }
}

function isMissingTable(error) {
  return error?.code === 'P2021' || error?.code === 'P2022';
}
