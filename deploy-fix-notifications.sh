#!/bin/bash

# Fix for notifications 500 error - Apply database migrations
echo "🔧 Fixing notifications 500 error..."

# Check if we're in the right directory
if [ ! -f "docker-compose.coolify.yml" ]; then
    echo "❌ Error: docker-compose.coolify.yml not found. Please run from project root."
    exit 1
fi

echo "📦 Step 1: Apply database migrations..."
docker-compose -f docker-compose.coolify.yml run --rm migrate

echo "✅ Step 2: Restart backend service..."
docker-compose -f docker-compose.coolify.yml restart backend

echo "🎉 Notifications fix complete! The /api/notifications/ endpoint should now work."

# Test the endpoint (optional)
echo "🧪 Testing notifications endpoint..."
curl -X GET "http://localhost:8000/api/notifications/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  --max-time 10 \
  --silent \
  --show-error \
  --write-out "HTTP Status: %{http_code}\n" || echo "Note: You'll need to provide a valid JWT token to test the endpoint"
