# Fix for Notifications 500 Error

## Problem
The frontend is getting a 500 Internal Server Error when calling `/api/notifications/` because the database table doesn't exist in the production environment.

## Root Cause
The notifications app was created but the database migrations haven't been applied in production.

## Solutions

### Option 1: Automatic Fix (Recommended)
The deployment has been updated with a migration service that will automatically apply migrations before starting the backend.

**Just redeploy your application** and the issue should be resolved.

### Option 2: Manual Fix
If you need to apply migrations manually:

#### In Production (Coolify/Docker):
```bash
# Apply migrations
docker-compose -f docker-compose.coolify.yml run --rm migrate

# Restart backend
docker-compose -f docker-compose.coolify.yml restart backend
```

#### Or use the provided script:
```bash
chmod +x deploy-fix-notifications.sh
./deploy-fix-notifications.sh
```

### Option 3: Graceful Degradation (Temporary)
The backend code has been updated to handle database errors gracefully. If the notifications table doesn't exist, it will return an empty list instead of a 500 error.

## What Changed

### Backend Changes:
1. **Added error handling** to notification views to return empty responses if the table doesn't exist
2. **Updated Docker Compose** to include a migration service
3. **Made backend depend on migrations** before starting

### Frontend:
No changes needed - the frontend will automatically work once the backend is fixed.

## Verification
After applying the fix, the notifications endpoint should return:
- Empty array `[]` if no notifications exist (good)
- Array of notification objects if notifications exist (good)
- No more 500 errors

## Testing
You can test the endpoint with:
```bash
curl -X GET "https://sankofa-api.mawuvision.com/api/notifications/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Replace `YOUR_JWT_TOKEN` with a valid token from your authenticated user.
