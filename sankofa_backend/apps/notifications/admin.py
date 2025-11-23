from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "category", "read", "created_at")
    list_filter = ("read", "category", "created_at")
    search_fields = ("title", "body", "user__phone_number", "user__full_name")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
