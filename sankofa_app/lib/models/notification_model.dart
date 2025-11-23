class NotificationModel {
  final String id;
  final String? userId;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime date;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? actionUrl;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.date,
    required this.createdAt,
    required this.updatedAt,
    this.userId,
    this.actionUrl,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'title': title,
        'message': message,
        'type': type,
        'isRead': isRead,
        'date': date.toIso8601String(),
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'actionUrl': actionUrl,
      };

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    final message = (json['message'] ?? json['body'] ?? '') as String;
    final type = (json['type'] ?? json['category'] ?? 'general') as String;
    final createdAtString =
        json['createdAt'] ?? json['created_at'] ?? json['date'] ?? DateTime.now().toIso8601String();

    DateTime _parseDate(Object? value) {
      if (value is String && value.isNotEmpty) {
        return DateTime.parse(value);
      }
      return DateTime.now();
    }

    final createdAt = _parseDate(createdAtString);
    final updatedAt = _parseDate(json['updatedAt'] ?? json['updated_at'] ?? createdAtString);
    final date = _parseDate(json['date'] ?? createdAtString);

    return NotificationModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user']?.toString(),
      title: (json['title'] ?? '') as String,
      message: message,
      type: type,
      isRead: json['isRead'] as bool? ?? json['read'] as bool? ?? false,
      date: date,
      createdAt: createdAt,
      updatedAt: updatedAt,
      actionUrl: json['actionUrl']?.toString() ?? json['action_url']?.toString(),
    );
  }

  NotificationModel copyWith({
    String? id,
    String? userId,
    String? title,
    String? message,
    String? type,
    bool? isRead,
    DateTime? date,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? actionUrl,
  }) =>
      NotificationModel(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        title: title ?? this.title,
        message: message ?? this.message,
        type: type ?? this.type,
        isRead: isRead ?? this.isRead,
        date: date ?? this.date,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        actionUrl: actionUrl ?? this.actionUrl,
      );
}
