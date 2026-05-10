import { prisma } from '../config/db';

export const notificationService = {
  async getMyNotifications(userId: string, { page = 1, limit = 20 }: { page?: number; limit?: number }) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where:   { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take:    limit,
        select: {
          id:         true,
          title:      true,
          message:    true,
          is_read:    true,
          created_at: true,
          sender:     { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.notification.count({ where: { user_id: userId } }),
    ]);

    // Normalize field names to match frontend expectation (read vs is_read, sender info)
    const data = notifications.map(n => ({
      id:         n.id,
      title:      n.title,
      message:    n.message,
      read:       n.is_read,
      created_at: n.created_at,
      sender:     n.sender?.name   ?? null,
      senderRole: n.sender?.role   ?? null,
    }));

    const unreadCount = await prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });

    return { notifications: data, total, page, limit, unreadCount };
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data:  { is_read: true },
    });
  },

  async markOneRead(notificationId: string, userId: string) {
    const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
    if (notif.user_id !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });

    return prisma.notification.update({
      where: { id: notificationId },
      data:  { is_read: true },
    });
  },
};
