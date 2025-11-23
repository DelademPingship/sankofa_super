/**
 * Notification Service
 * Handles user notifications
 */

import { apiClient } from '../lib/apiClient';
import type { Notification } from '../lib/types';

type ApiNotification = {
  id?: string;
  title?: string;
  body?: string;
  category?: string;
  action_url?: string;
  actionUrl?: string;
  read?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

class NotificationService {
  private cachedNotifications: Notification[] | null = null;

  /**
   * Get all notifications for the current user
   */
  async getNotifications(forceRefresh: boolean = false): Promise<Notification[]> {
    if (!forceRefresh && this.cachedNotifications) {
      return this.cachedNotifications;
    }

    try {
      const response = await apiClient.get<ApiNotification[]>('/api/notifications/');
      if (Array.isArray(response)) {
        const normalized = response.map(this.normalizeNotification);
        this.cacheNotifications(normalized);
        return normalized;
      }
    } catch {
      // Fall back to cached data on error
    }

    if (!this.cachedNotifications) {
      this.cachedNotifications = [];
    }
    return this.cachedNotifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/notifications/${id}/mark-read/`);
    } catch {
      // Ignore errors
    }

    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post('/api/notifications/mark-all-read/');
    } catch {
      // Ignore errors
    }

    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.map((notification) => ({
        ...notification,
        read: true,
      }));
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    if (!this.cachedNotifications) {
      return 0;
    }
    return this.cachedNotifications.filter((n) => !n.read).length;
  }

  /**
   * Clear cached notifications
   */
  clearCache(): void {
    this.cachedNotifications = null;
  }

  /**
   * Cache notifications locally
   */
  private cacheNotifications(notifications: Notification[]): void {
    this.cachedNotifications = notifications;
  }

  private normalizeNotification = (apiNotification: ApiNotification): Notification => {
    const createdAt =
      apiNotification.createdAt ||
      apiNotification.created_at ||
      new Date().toISOString();

    const generatedId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      id: apiNotification.id ?? generatedId,
      title: apiNotification.title ?? 'Notification',
      body: apiNotification.body ?? '',
      category: apiNotification.category,
      actionUrl: apiNotification.actionUrl ?? apiNotification.action_url,
      read: apiNotification.read ?? false,
      createdAt,
    };
  };
}

export const notificationService = new NotificationService();
