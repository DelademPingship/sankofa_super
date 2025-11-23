from __future__ import annotations

import uuid
from django.conf import settings
from django.db import models


class NotificationQuerySet(models.QuerySet):
    def unread(self):
        return self.filter(read=False)


class Notification(models.Model):
    """Simple notification persisted per user so mobile/web can share data."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    body = models.TextField()
    category = models.CharField(max_length=64, blank=True)
    action_url = models.URLField(blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = NotificationQuerySet.as_manager()

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["user", "-created_at"], name="notif_user_created_idx"),
            models.Index(fields=["user", "read"], name="notif_user_read_idx"),
        ]

    def mark_read(self, commit: bool = True) -> None:
        if not self.read:
            self.read = True
            if commit:
                self.save(update_fields=["read", "updated_at"])
