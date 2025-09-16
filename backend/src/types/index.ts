import { Request } from 'express';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
      timestamp?: string;
    }
  }
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  accountType: 'fan' | 'creator' | 'admin' | 'moderator';
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending_verification';
  emailVerified: boolean;
  ageVerified: boolean;
  subscriptionPrice?: number;
  profileImageUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  interests: string[];
  preferences: Record<string, any>;
  isPrivate: boolean;
  customUrl?: string;
  verificationLevel: 'none' | 'email' | 'phone' | 'identity' | 'full';
  contentCategories: string[];
  languages: string[];
  timezone: string;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newFollowers: boolean;
  newSubscribers: boolean;
  newMessages: boolean;
  newTips: boolean;
  contentLikes: boolean;
  contentComments: boolean;
  liveStreamReminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'subscribers' | 'private';
  showOnlineStatus: boolean;
  allowDirectMessages: 'everyone' | 'subscribers' | 'none';
  showSubscriberCount: boolean;
  showEarnings: boolean;
}

// Content Types
export interface Content {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  contentType: 'image' | 'video' | 'audio' | 'text' | 'live_stream';
  fileUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  visibility: 'public' | 'subscribers' | 'premium';
  isPremium: boolean;
  price?: number;
  tags: string[];
  contentWarning?: string;
  isScheduled: boolean;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'archived' | 'removed';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Types
export interface Subscription {
  id: string;
  subscriberId: string;
  creatorId: string;
  tier: 'monthly' | 'yearly' | 'lifetime';
  price: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'failed';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Conversation {
  id: string;
  participantId1: string;
  participantId2: string;
  lastMessageId?: string;
  lastMessageAt?: Date;
  unreadCountUser1: number;
  unreadCountUser2: number;
  isArchived1: boolean;
  isArchived2: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content?: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isPremium: boolean;
  price?: number;
  readAt?: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Transaction {
  id: string;
  userId: string;
  recipientId?: string;
  type: 'subscription' | 'tip' | 'content_purchase' | 'message_purchase' | 'stream_access' | 'payout' | 'refund';
  amount: number;
  currency: string;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank' | 'crypto' | 'wallet';
  stripePaymentId?: string;
  description?: string;
  metadata?: Record<string, any>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tip {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  contentId?: string;
  messageId?: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Live Streaming Types
export interface LiveStream {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  streamKey: string;
  isPrivate: boolean;
  price?: number;
  status: 'scheduled' | 'live' | 'ended';
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  currentViewers: number;
  peakViewers: number;
  totalViews: number;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface ContentAnalytics {
  id: string;
  contentId: string;
  userId: string;
  eventType: 'view' | 'like' | 'share' | 'comment' | 'download' | 'purchase';
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  country?: string;
  region?: string;
  city?: string;
  device: string;
  browser: string;
  duration?: number;
  createdAt: Date;
}

export interface UserAnalytics {
  id: string;
  userId: string;
  targetUserId?: string;
  eventType: 'login' | 'logout' | 'profile_view' | 'subscription' | 'unsubscription' | 'tip_sent' | 'tip_received' | 'content_upload' | 'message_sent';
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  region?: string;
  city?: string;
  device: string;
  browser: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  accountType: string;
  iat?: number;
  exp?: number;
}

// File Upload Types
export interface FileUploadResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

// Error Types
export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

// Database Query Types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, any>;
  include?: string[];
}

// Content Moderation Types
export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: 'user' | 'content' | 'message';
  targetId: string;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'underage' | 'other';
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  assignedModeratorId?: string;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  targetType: 'user' | 'content' | 'message';
  targetId: string;
  action: 'warning' | 'content_removal' | 'account_suspension' | 'account_ban' | 'no_action';
  reason: string;
  duration?: number;
  notes?: string;
  reportId?: string;
  createdAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}