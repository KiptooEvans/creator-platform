# Database Schema Documentation

This document provides a comprehensive overview of the Creator Platform database schema, including all tables, relationships, analytics capabilities, and moderation features.

## Database Overview

- **Database Engine**: PostgreSQL 13+
- **Extensions Used**: uuid-ossp, pgcrypto
- **Primary Key Type**: UUID (v4)
- **Timestamp Type**: TIMESTAMP WITH TIME ZONE
- **Supported Features**: Analytics tracking, Audit logging, Content moderation

## Core Entity Relationships

```
Users (1) ←→ (M) User Profiles
Users (1) ←→ (M) Content
Users (M) ←→ (M) Subscriptions (subscriber/creator)
Users (M) ←→ (M) Follows (follower/following)
Users (1) ←→ (M) Conversations
Content (1) ←→ (M) Likes
Content (1) ←→ (M) Comments
Content (1) ←→ (M) Content Analytics
```

---

## Core Tables

### Users
Primary user accounts table with authentication and basic profile information.

**Key Features:**
- UUID primary keys for security
- Multiple account types (fan, creator, admin, moderator)
- Age verification system
- Account status management
- Soft deletion support

**Important Fields:**
- `account_type`: Determines user permissions and features
- `subscription_price`: Set by creators for monthly subscriptions
- `age_verified`: Required for platform access
- `account_status`: Controls account access

### User Profiles
Extended profile information for creators and detailed user preferences.

**Key Features:**
- Social media integrations
- Content categorization
- Personal preferences and characteristics
- Location and demographic data

### Content
Main content storage with support for multiple media types and monetization.

**Content Types:**
- `image`: Photo posts
- `video`: Video content
- `audio`: Audio posts
- `text`: Text-only posts
- `live_stream`: Live streaming content

**Monetization Features:**
- Premium content with individual pricing
- Subscription-gated content
- Scheduled publishing
- Content warnings and age restrictions

### Subscriptions
Manages recurring subscriptions between fans and creators.

**Subscription Types:**
- `monthly`: Recurring monthly billing
- `yearly`: Annual subscriptions with discount
- `lifetime`: One-time payment for permanent access

**Status Management:**
- `active`: Currently active subscription
- `cancelled`: Cancelled but active until period end
- `expired`: Past due date
- `pending`: Payment processing
- `failed`: Payment failed

---

## Messaging System

### Conversations
One-to-one conversations between creators and fans.

**Features:**
- Unread message counters for both parties
- Archive functionality
- Last message timestamp tracking

### Messages
Individual messages within conversations with premium message support.

**Premium Messages:**
- Creators can charge for viewing messages
- Media attachments (images, videos, audio)
- Read receipts and timestamps

---

## Payment & Monetization

### Transactions
Comprehensive transaction logging for all platform payments.

**Transaction Types:**
- `subscription`: Monthly/yearly subscription payments
- `tip`: One-time tips to creators
- `content_purchase`: Pay-per-view content purchases
- `message_purchase`: Premium message purchases
- `stream_access`: Live stream access payments
- `payout`: Creator earnings withdrawals
- `refund`: Payment refunds

**Financial Tracking:**
- Gross amount, platform fees, and net amounts
- Payment processor integration
- Failure reason logging

### Tips
Direct monetary support from fans to creators.

**Features:**
- Optional tip messages
- Anonymous tipping option
- Context association (content or message)
- Multiple payment methods

---

## Live Streaming

### Live Streams
Live streaming capabilities with premium access control.

**Stream Management:**
- Stream key generation for broadcasting
- Viewer count tracking (current and peak)
- Premium stream pricing
- Scheduling support

### Stream Access
Tracks user participation in live streams.

**Analytics Data:**
- Join/leave timestamps
- Total viewing duration
- Viewer engagement metrics

---

## ANALYTICS SYSTEM

### Content Analytics
Comprehensive content performance tracking.

**Tracked Events:**
- `view`: Content views with duration
- `like`/`unlike`: Engagement tracking
- `share`: Social sharing metrics
- `comment`: Comment interactions
- `download`: Content downloads
- `purchase`: Purchase conversions

**Geographic Data:**
- IP-based location tracking
- Country, region, and city information
- Device and browser analytics

### User Analytics
Platform usage and behavior tracking.

**Tracked Events:**
- `login`/`logout`: Session management
- `profile_view`: Profile visit tracking
- `subscription`/`unsubscription`: Subscription events
- `tip_sent`/`tip_received`: Tipping activity
- `content_upload`: Creator activity
- `message_sent`: Communication metrics

### Revenue Analytics
Financial performance tracking for creators and platform.

**Data Points:**
- Revenue by type and time period
- Platform fee calculations
- Creator earnings breakdown
- Hourly and daily revenue tracking

**Revenue Types:**
- Subscription income
- Tips and donations
- Content sales (PPV)
- Message sales
- Live stream access fees

---

## AUDIT & LOGGING SYSTEM

### Audit Logs
Comprehensive system action logging for compliance and security.

**Logged Actions:**
- User account changes
- Content modifications
- Payment transactions
- Administrative actions
- Security events

**Data Captured:**
- Before/after values (JSONB)
- User and admin identification
- IP address and user agent
- Severity classification
- Detailed descriptions

### System Logs
Technical system logging for debugging and monitoring.

**Log Levels:**
- `debug`: Development information
- `info`: General information
- `warning`: Potential issues
- `error`: Error conditions
- `critical`: System failures

**Context Data:**
- Service and component identification
- Stack traces for errors
- Request/session correlation
- Metadata storage (JSONB)

---

## CONTENT MODERATION SYSTEM

### Content Reports
User-generated reports for inappropriate content or behavior.

**Report Types:**
- `inappropriate_content`: Violates content policy
- `copyright_violation`: Copyright infringement
- `harassment`: User harassment
- `spam`: Spam content
- `underage`: Underage content concerns
- `non_consensual`: Non-consensual content
- `violence`: Violent content
- `hate_speech`: Hate speech violations
- `other`: Other violations

**Workflow Management:**
- Priority classification (low, medium, high, critical)
- Moderator assignment
- Resolution tracking
- Evidence attachment support

### Content Moderation Actions
Administrative actions taken on content by moderators.

**Available Actions:**
- `approve`: Approve reported content
- `reject`: Reject content submission
- `remove`: Remove content from platform
- `flag`: Flag for additional review
- `age_restrict`: Add age restrictions
- `shadow_ban`: Reduce content visibility
- `require_warning`: Add content warnings

**Automation Support:**
- AI moderation integration
- Confidence scoring for automated decisions
- Human review escalation

### User Violations
Track user policy violations and enforcement actions.

**Violation Management:**
- Severity classification
- Evidence storage (JSONB)
- Action duration tracking
- Escalation patterns

**Enforcement Actions:**
- Warnings and notifications
- Temporary suspensions
- Permanent bans
- Feature restrictions

---

## Social Features

### Follows
Fan/creator relationship management.

**Features:**
- Notification preferences
- Follow/unfollow tracking
- Creator discovery

### Likes & Comments
Content engagement features.

**Comments System:**
- Threaded replies support
- Moderation capabilities
- Creator interaction prioritization

### Notifications
Real-time user notifications.

**Notification Types:**
- New subscribers
- Content interactions (likes, comments)
- Messages and tips
- System announcements
- Moderation actions

---

## Performance Optimization

### Database Indexes
Strategic indexing for query performance:

```sql
-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_type ON users(account_type);

-- Content queries
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_created_at ON content(created_at DESC);

-- Analytics performance
CREATE INDEX idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_created_at ON content_analytics(created_at DESC);

-- Moderation queries
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Query Optimization Tips

1. **Content Feeds**: Use pagination with `created_at` ordering
2. **Analytics Queries**: Pre-aggregate data for dashboard performance
3. **User Searches**: Full-text search on username and display name
4. **Revenue Reports**: Use date partitioning for large datasets

---

## Data Retention & Archival

### Retention Policies

| Data Type | Retention Period | Action |
|-----------|------------------|--------|
| Analytics Events | 2 years | Archive to cold storage |
| Audit Logs | 7 years | Legal compliance |
| System Logs | 90 days | Delete |
| Deleted Content | 30 days | Permanent deletion |
| User Sessions | 30 days | Cleanup |

### Archival Strategy

1. **Hot Data**: Current operational data (PostgreSQL)
2. **Warm Data**: Recent analytics (PostgreSQL + Read replicas)
3. **Cold Data**: Historical analytics (S3/Glacier)

---

## Security Considerations

### Data Protection
- All PII encrypted at rest
- Secure password hashing (bcrypt)
- JWT token management
- Rate limiting on sensitive operations

### Access Control
- Role-based permissions
- API endpoint protection
- Database row-level security
- Audit trail for all changes

### Compliance
- GDPR compliance ready
- Right to erasure support
- Data export capabilities
- Privacy controls

---

## Backup & Recovery

### Backup Strategy
- **Daily**: Full database backup
- **Hourly**: Transaction log backup
- **Weekly**: Offsite backup copy
- **Monthly**: Compliance backup retention

### Recovery Procedures
1. Point-in-time recovery capability
2. Replica failover procedures
3. Data corruption recovery
4. Disaster recovery protocols

---

## Migration Guidelines

### Schema Changes
1. Use migrations for all schema changes
2. Backward compatibility considerations
3. Zero-downtime deployment strategy
4. Rollback procedures

### Data Migration
1. Large dataset migration strategies
2. Performance impact minimization
3. Data validation procedures
4. Rollback data integrity