from __future__ import annotations

from django.db import DatabaseError
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            queryset = Notification.objects.filter(user=request.user).order_by("-created_at")
            serializer = NotificationSerializer(queryset, many=True)
            return Response(serializer.data)
        except DatabaseError:
            # Return empty list if notifications table doesn't exist or has issues
            return Response([])


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: str):
        try:
            notification = Notification.objects.get(user=request.user, pk=pk)
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except DatabaseError:
            # Return 404 if notifications table doesn't exist
            return Response(status=status.HTTP_404_NOT_FOUND)
        notification.mark_read()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            Notification.objects.filter(user=request.user, read=False).update(read=True)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DatabaseError:
            # Return success if notifications table doesn't exist
            return Response(status=status.HTTP_204_NO_CONTENT)
