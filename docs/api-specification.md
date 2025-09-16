# Creator Platform REST API Specification

## Base URL
```
Production: https://api.creatorplatform.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All responses follow this standard format:
```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "errors": array,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, 3-50 chars, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 8 chars)",
  "confirmPassword": "string (required, must match password)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "birthDate": "string (required, ISO date, must be 18+)",
  "accountType": "string (required: 'fan' | 'creator')",
  "agreeToTerms": "boolean (required, must be true)"
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "rememberMe": "boolean (optional)"
}
```

### POST /auth/logout
Invalidate current session.

### POST /auth/refresh
Refresh JWT token.

### POST /auth/forgot-password
Send password reset email.

**Request Body:**
```json
{
  "email": "string (required)"
}
```

### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "string (required)",
  "newPassword": "string (required)",
  "confirmPassword": "string (required)"
}
```

### POST /auth/verify-email
Verify email address with token.

**Request Body:**
```json
{
  "token": "string (required)"
}
```

---

## User Management Endpoints

### GET /users/me
Get current user profile.

### PUT /users/me
Update current user profile.

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "displayName": "string (optional)",
  "bio": "string (optional)",
  "subscriptionPrice": "number (optional, creators only)",
  "location": "string (optional)",
  "website": "string (optional)",
  "interests": "array (optional)"
}
```

### POST /users/me/avatar
Upload user avatar image.

**Request:** Multipart form data with image file.

### POST /users/me/cover
Upload user cover image.

### GET /users/:userId
Get public user profile by ID.

### GET /users/:username
Get public user profile by username.

### POST /users/:userId/follow
Follow a user.

### DELETE /users/:userId/follow
Unfollow a user.

### GET /users/:userId/followers
Get user's followers list.

### GET /users/:userId/following
Get users that this user follows.

### POST /users/me/age-verification
Submit age verification documents.

**Request:** Multipart form data with verification documents.

---

## Content Management Endpoints

### GET /content
Get content feed with filters.

**Query Parameters:**
```
?page=number&limit=number&type=string&tags=string&creator=string&sort=string
```

### POST /content
Create new content.

**Request:** Multipart form data
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "contentType": "string (required: 'image' | 'video' | 'audio' | 'text')",
  "isPremium": "boolean (optional)",
  "price": "number (optional)",
  "visibility": "string (optional: 'public' | 'subscribers' | 'premium')",
  "tags": "array (optional)",
  "scheduledAt": "string (optional, ISO date)",
  "contentWarning": "string (optional)"
}
```

### GET /content/:contentId
Get content by ID.

### PUT /content/:contentId
Update content.

### DELETE /content/:contentId
Delete content.

### POST /content/:contentId/like
Like content.

### DELETE /content/:contentId/like
Unlike content.

### GET /content/:contentId/likes
Get content likes.

### POST /content/:contentId/purchase
Purchase premium content.

**Request Body:**
```json
{
  "paymentMethodId": "string (required)"
}
```

### GET /content/:contentId/comments
Get content comments.

### POST /content/:contentId/comments
Add comment to content.

**Request Body:**
```json
{
  "text": "string (required)",
  "parentId": "string (optional, for replies)"
}
```

---

## Subscription Endpoints

### GET /subscriptions
Get user's subscriptions.

### POST /subscriptions
Subscribe to a creator.

**Request Body:**
```json
{
  "creatorId": "string (required)",
  "subscriptionType": "string (required: 'monthly' | 'yearly')",
  "paymentMethodId": "string (required)"
}
```

### PUT /subscriptions/:subscriptionId
Update subscription (e.g., cancel).

**Request Body:**
```json
{
  "autoRenew": "boolean (optional)",
  "cancelAtPeriodEnd": "boolean (optional)"
}
```

### DELETE /subscriptions/:subscriptionId
Cancel subscription immediately.

### GET /subscriptions/creators/:creatorId/subscribers
Get creator's subscribers (creator/admin only).

---

## Messaging Endpoints

### GET /messages/conversations
Get user's conversations.

### GET /messages/conversations/:conversationId
Get messages in a conversation.

### POST /messages/conversations/:conversationId/messages
Send message.

**Request:** Multipart form data
```json
{
  "text": "string (optional)",
  "isPremium": "boolean (optional)",
  "price": "number (optional, if premium)"
}
```

### PUT /messages/:messageId/read
Mark message as read.

### POST /messages/:messageId/purchase
Purchase premium message.

**Request Body:**
```json
{
  "paymentMethodId": "string (required)"
}
```

---

## Payment Endpoints

### GET /payments/methods
Get user's payment methods.

### POST /payments/methods
Add payment method.

**Request Body:**
```json
{
  "type": "string (required: 'card' | 'bank')",
  "token": "string (required, from payment processor)"
}
```

### DELETE /payments/methods/:methodId
Remove payment method.

### GET /payments/transactions
Get user's transaction history.

### POST /payments/tips
Send tip to creator.

**Request Body:**
```json
{
  "recipientId": "string (required)",
  "amount": "number (required)",
  "message": "string (optional)",
  "isAnonymous": "boolean (optional)",
  "contentId": "string (optional)",
  "paymentMethodId": "string (required)"
}
```

---

## Live Streaming Endpoints

### GET /streams
Get live streams.

### POST /streams
Create/schedule live stream.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "scheduledAt": "string (optional, ISO date)",
  "isPremium": "boolean (optional)",
  "price": "number (optional)",
  "tags": "array (optional)"
}
```

### GET /streams/:streamId
Get stream details.

### PUT /streams/:streamId
Update stream.

### POST /streams/:streamId/start
Start live stream.

### POST /streams/:streamId/end
End live stream.

### POST /streams/:streamId/join
Join live stream.

### POST /streams/:streamId/leave
Leave live stream.

---

## Analytics Endpoints (Creators/Admins)

### GET /analytics/content
Get content analytics.

**Query Parameters:**
```
?period=string&contentId=string&startDate=string&endDate=string
```

### GET /analytics/revenue
Get revenue analytics.

### GET /analytics/audience
Get audience analytics.

### GET /analytics/engagement
Get engagement metrics.

---

## Admin/Moderation Endpoints

### GET /admin/users
Get users list (admin only).

### PUT /admin/users/:userId/status
Update user status (suspend/ban/activate).

**Request Body:**
```json
{
  "status": "string (required: 'active' | 'suspended' | 'banned')",
  "reason": "string (optional)"
}
```

### GET /admin/content/reports
Get content reports.

### PUT /admin/content/reports/:reportId
Update report status.

**Request Body:**
```json
{
  "status": "string (required: 'under_review' | 'resolved' | 'dismissed')",
  "resolution": "string (optional)",
  "action": "string (optional)"
}
```

### POST /admin/content/:contentId/moderate
Take moderation action on content.

**Request Body:**
```json
{
  "action": "string (required: 'approve' | 'remove' | 'flag')",
  "reason": "string (required)",
  "details": "string (optional)"
}
```

### GET /admin/analytics/platform
Get platform-wide analytics.

### GET /admin/logs/audit
Get audit logs.

### GET /admin/logs/system
Get system logs.

---

## Reporting Endpoints

### POST /reports/content
Report content.

**Request Body:**
```json
{
  "contentId": "string (required)",
  "userId": "string (required)",
  "reportType": "string (required: 'inappropriate_content' | 'harassment' | etc.)",
  "reason": "string (required)",
  "additionalDetails": "string (optional)",
  "evidenceUrls": "array (optional)"
}
```

### POST /reports/user
Report user.

**Request Body:**
```json
{
  "userId": "string (required)",
  "reportType": "string (required)",
  "reason": "string (required)",
  "additionalDetails": "string (optional)"
}
```

---

## Notification Endpoints

### GET /notifications
Get user notifications.

### PUT /notifications/:notificationId/read
Mark notification as read.

### PUT /notifications/mark-all-read
Mark all notifications as read.

### GET /notifications/settings
Get notification preferences.

### PUT /notifications/settings
Update notification preferences.

**Request Body:**
```json
{
  "emailNotifications": "boolean",
  "pushNotifications": "boolean",
  "smsNotifications": "boolean",
  "newSubscriber": "boolean",
  "newMessage": "boolean",
  "newTip": "boolean",
  "contentLike": "boolean"
}
```

---

## Search Endpoints

### GET /search/users
Search users.

**Query Parameters:**
```
?q=string&type=string&location=string&page=number&limit=number
```

### GET /search/content
Search content.

**Query Parameters:**
```
?q=string&type=string&tags=string&creator=string&page=number&limit=number
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Content upload**: 10 requests per hour
- **General API**: 1000 requests per hour
- **Search**: 100 requests per hour

---

## Webhooks

### Payment Events
- `payment.succeeded`
- `payment.failed` 
- `subscription.created`
- `subscription.cancelled`

### Content Events
- `content.uploaded`
- `content.moderated`

### User Events
- `user.verified`
- `user.suspended`

**Webhook Payload:**
```json
{
  "event": "string",
  "data": "object",
  "timestamp": "string (ISO date)",
  "signature": "string"
}
```