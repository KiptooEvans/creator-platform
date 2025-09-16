import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from '../config/config';
import { User, Content, Subscription, QueryOptions } from '../types';

export class DatabaseService {
  private static pool: Pool;

  public static async initialize(): Promise<void> {
    try {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      throw error;
    }
  }

  public static async query(
    text: string,
    params?: any[]
  ): Promise<QueryResult<any>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (config.nodeEnv === 'development') {
        console.log('📊 Query executed:', { text, duration: `${duration}ms`, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error('❌ Database query error:', { text, params, duration: `${duration}ms`, error });
      throw error;
    }
  }

  public static async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public static async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User Management Methods
  public static async getUserById(userId: string): Promise<User | null> {
    const query = `
      SELECT u.*, up.interests, up.is_private, up.custom_url, up.verification_level,
             up.content_categories, up.languages, up.timezone
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `;
    
    const result = await this.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapUserFromDb(result.rows[0]);
  }

  public static async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT u.*, up.interests, up.is_private, up.custom_url, up.verification_level,
             up.content_categories, up.languages, up.timezone
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = $1 AND u.deleted_at IS NULL
    `;
    
    const result = await this.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapUserFromDb(result.rows[0]);
  }

  public static async getUserByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT u.*, up.interests, up.is_private, up.custom_url, up.verification_level,
             up.content_categories, up.languages, up.timezone
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.username = $1 AND u.deleted_at IS NULL
    `;
    
    const result = await this.query(query, [username.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapUserFromDb(result.rows[0]);
  }

  public static async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      accountType,
      displayName,
      bio,
      location,
      website
    } = userData;

    return await this.transaction(async (client) => {
      // Create user
      const userQuery = `
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, 
          account_type, display_name, bio, location, website,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *
      `;

      const userResult = await client.query(userQuery, [
        username?.toLowerCase(),
        email?.toLowerCase(),
        password, // This should already be hashed
        firstName,
        lastName,
        accountType || 'fan',
        displayName,
        bio,
        location,
        website
      ]);

      const user = userResult.rows[0];

      // Create user profile
      const profileQuery = `
        INSERT INTO user_profiles (
          user_id, interests, preferences, is_private, verification_level,
          content_categories, languages, timezone, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `;

      await client.query(profileQuery, [
        user.id,
        JSON.stringify([]),
        JSON.stringify({}),
        false,
        'none',
        JSON.stringify([]),
        JSON.stringify(['en']),
        'UTC'
      ]);

      return this.mapUserFromDb(user);
    });
  }

  public static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.camelToSnakeCase(key);
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getUserById(userId);
    }

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    values.push(userId); // For WHERE clause

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex + 1} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapUserFromDb(result.rows[0]);
  }

  // Content Management Methods
  public static async getContentById(contentId: string): Promise<Content | null> {
    const query = `
      SELECT * FROM content 
      WHERE id = $1 AND status != 'removed'
    `;
    
    const result = await this.query(query, [contentId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapContentFromDb(result.rows[0]);
  }

  public static async getContentByUser(
    userId: string,
    options: QueryOptions = {}
  ): Promise<{ content: Content[]; total: number }> {
    const { limit = 20, offset = 0, orderBy = 'created_at', orderDirection = 'DESC' } = options;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM content 
      WHERE user_id = $1 AND status = 'published'
    `;
    
    const countResult = await this.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT * FROM content 
      WHERE user_id = $1 AND status = 'published'
      ORDER BY ${orderBy} ${orderDirection}
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.query(query, [userId, limit, offset]);
    const content = result.rows.map(row => this.mapContentFromDb(row));

    return { content, total };
  }

  // Subscription Methods
  public static async getActiveSubscription(subscriberId: string, creatorId: string): Promise<Subscription | null> {
    const query = `
      SELECT * FROM subscriptions 
      WHERE subscriber_id = $1 AND creator_id = $2 AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await this.query(query, [subscriberId, creatorId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapSubscriptionFromDb(result.rows[0]);
  }

  // Utility Methods
  private static mapUserFromDb(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      displayName: row.display_name,
      accountType: row.account_type,
      accountStatus: row.account_status,
      emailVerified: row.email_verified,
      ageVerified: row.age_verified,
      subscriptionPrice: row.subscription_price,
      profileImageUrl: row.profile_image_url,
      coverImageUrl: row.cover_image_url,
      bio: row.bio,
      location: row.location,
      website: row.website,
      socialLinks: row.social_links || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private static mapContentFromDb(row: any): Content {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      contentType: row.content_type,
      fileUrl: row.file_url,
      thumbnailUrl: row.thumbnail_url,
      duration: row.duration,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      visibility: row.visibility,
      isPremium: row.is_premium,
      price: row.price,
      tags: row.tags || [],
      contentWarning: row.content_warning,
      isScheduled: row.is_scheduled,
      scheduledAt: row.scheduled_at,
      publishedAt: row.published_at,
      status: row.status,
      viewCount: row.view_count,
      likeCount: row.like_count,
      commentCount: row.comment_count,
      shareCount: row.share_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private static mapSubscriptionFromDb(row: any): Subscription {
    return {
      id: row.id,
      subscriberId: row.subscriber_id,
      creatorId: row.creator_id,
      tier: row.tier,
      price: row.price,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      autoRenew: row.auto_renew,
      stripeSubscriptionId: row.stripe_subscription_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  public static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('📦 PostgreSQL connection pool closed');
    }
  }
}