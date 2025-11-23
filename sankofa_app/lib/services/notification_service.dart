import 'package:flutter/foundation.dart';
import 'package:sankofasave/models/notification_model.dart';

import 'api_client.dart';

class NotificationService {
  NotificationService._internal();

  static final NotificationService _instance = NotificationService._internal();

  factory NotificationService() => _instance;

  static const String _localNotificationPrefix = 'notif_';

  final ApiClient _apiClient = ApiClient();
  final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);

  List<NotificationModel> _notifications = [];

  Future<List<NotificationModel>> getNotifications({bool forceRefresh = false}) async {
    if (_notifications.isNotEmpty && !forceRefresh) {
      return List.unmodifiable(_notifications);
    }

    final localNotifications = _notifications.where(_isLocalNotification).toList();

    try {
      final response = await _apiClient.get('/api/notifications/');
      if (response is List) {
        final remoteNotifications = _parseNotificationList(response);
        _notifications = [...remoteNotifications, ...localNotifications];
        _updateUnreadCount();
        return List.unmodifiable(_notifications);
      }
    } catch (error) {
      debugPrint('Failed to fetch notifications: $error');
    }

    if (_notifications.isEmpty && localNotifications.isNotEmpty) {
      _notifications = [...localNotifications];
      _updateUnreadCount();
    }

    return List.unmodifiable(_notifications);
  }

  Future<void> addNotification(NotificationModel notification) async {
    final normalizedNotification = notification.id.startsWith(_localNotificationPrefix)
        ? notification
        : notification.copyWith(id: '${_localNotificationPrefix}${notification.id}');
    _notifications = [normalizedNotification, ..._notifications];
    _updateUnreadCount();
  }

  Future<void> markAsRead(String id) async {
    if (!_isLocalId(id)) {
      try {
        await _apiClient.post('/api/notifications/$id/mark-read/');
      } catch (error) {
        debugPrint('Failed to mark notification as read: $error');
      }
    }
    _notifications = _notifications
        .map(
          (notification) => notification.id == id
              ? notification.copyWith(isRead: true, updatedAt: DateTime.now())
              : notification,
        )
        .toList();
    _updateUnreadCount();
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiClient.post('/api/notifications/mark-all-read/');
    } catch (error) {
      debugPrint('Failed to mark notifications as read: $error');
    }
    _notifications = _notifications
        .map((notification) => notification.copyWith(isRead: true, updatedAt: DateTime.now()))
        .toList();
    _updateUnreadCount();
  }

  Future<int> getUnreadCount() async {
    if (_notifications.isEmpty) {
      await getNotifications();
    }
    return _notifications.where((notification) => !notification.isRead).length;
  }

  void _updateUnreadCount() {
    final unread = _notifications.where((notification) => !notification.isRead).length;
    if (unreadCountNotifier.value != unread) {
      unreadCountNotifier.value = unread;
    }
  }

  List<NotificationModel> _parseNotificationList(List<dynamic> response) {
    final notifications = <NotificationModel>[];
    for (final item in response) {
      if (item is Map<String, dynamic>) {
        notifications.add(NotificationModel.fromJson(item));
      } else if (item is Map) {
        notifications.add(
          NotificationModel.fromJson(
            item.map((key, value) => MapEntry(key.toString(), value)),
          ),
        );
      }
    }
    return notifications;
  }

  bool _isLocalNotification(NotificationModel notification) => _isLocalId(notification.id);

  bool _isLocalId(String id) => id.startsWith(_localNotificationPrefix);
}
