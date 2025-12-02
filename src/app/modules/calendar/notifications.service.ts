import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type Notification = {
  id: string;
  userId: string;
  eventId: string;
  summary?: string;
  start?: string;
  createdAt: string;
  read?: boolean;
};

@Injectable()
export class NotificationsService {
  // In-memory store: userId -> Notification[]
  private store = new Map<string, Notification[]>();

  createForUser(userId: string, items: Array<{ eventId?: string; summary?: string; start?: string }>) {
    const now = new Date().toISOString();
    const list = this.store.get(userId) || [];

    const created = items.map((it) => {
      const n: Notification = {
        id: randomUUID(),
        userId,
        eventId: it.eventId ?? '',
        summary: it.summary,
        start: it.start,
        createdAt: now,
        read: false,
      };
      list.push(n);
      return n;
    });

    this.store.set(userId, list);
    return created;
  }

  findForUser(userId: string) {
    return this.store.get(userId) || [];
  }

  markRead(userId: string, notificationId: string) {
    const list = this.store.get(userId) || [];
    const found = list.find((n) => n.id === notificationId);
    if (found) {
      found.read = true;
      return true;
    }
    return false;
  }

  clearForUser(userId: string) {
    this.store.delete(userId);
  }
}
