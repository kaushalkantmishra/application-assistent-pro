import { neon } from "@neondatabase/serverless";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    return;
  }
  const sql = neon(url);

  console.log("Starting Phase 6 database table creation...");

  const queries = [
    // 1. Platform Settings
    `CREATE TABLE IF NOT EXISTS "platform_settings" (
      "id" text PRIMARY KEY,
      "maintenance_mode" boolean DEFAULT false NOT NULL,
      "theme" text DEFAULT 'dark' NOT NULL,
      "branding" jsonb DEFAULT '{}'::jsonb,
      "seo" jsonb DEFAULT '{}'::jsonb,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 2. Email Templates
    `CREATE TABLE IF NOT EXISTS "email_templates" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "subject" text NOT NULL,
      "html_content" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 3. Blogs
    `CREATE TABLE IF NOT EXISTS "blogs" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "content" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "author_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 4. Community Posts
    `CREATE TABLE IF NOT EXISTS "community_posts" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "category" text NOT NULL,
      "content" text NOT NULL,
      "likes_count" integer DEFAULT 0 NOT NULL,
      "comments_count" integer DEFAULT 0 NOT NULL,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 5. Community Comments
    `CREATE TABLE IF NOT EXISTS "community_comments" (
      "id" text PRIMARY KEY,
      "post_id" text NOT NULL REFERENCES "community_posts"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "comment_text" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 6. Community Likes
    `CREATE TABLE IF NOT EXISTS "community_likes" (
      "id" text PRIMARY KEY,
      "post_id" text NOT NULL REFERENCES "community_posts"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 7. Community Bookmarks
    `CREATE TABLE IF NOT EXISTS "community_bookmarks" (
      "id" text PRIMARY KEY,
      "post_id" text NOT NULL REFERENCES "community_posts"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 8. Community Followers
    `CREATE TABLE IF NOT EXISTS "community_followers" (
      "id" text PRIMARY KEY,
      "follower_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "following_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 9. Admin Logs
    `CREATE TABLE IF NOT EXISTS "admin_logs" (
      "id" text PRIMARY KEY,
      "admin_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "action_type" text NOT NULL,
      "entity_type" text NOT NULL,
      "entity_id" text,
      "notes" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 10. System Logs
    `CREATE TABLE IF NOT EXISTS "system_logs" (
      "id" text PRIMARY KEY,
      "log_level" text NOT NULL,
      "message" text NOT NULL,
      "context" jsonb DEFAULT '{}'::jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 11. Error Logs
    `CREATE TABLE IF NOT EXISTS "error_logs" (
      "id" text PRIMARY KEY,
      "error_name" text NOT NULL,
      "error_message" text NOT NULL,
      "stack_trace" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 12. Push Notifications
    `CREATE TABLE IF NOT EXISTS "push_notifications" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "title" text NOT NULL,
      "message" text NOT NULL,
      "is_sent" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 13. User Devices
    `CREATE TABLE IF NOT EXISTS "user_devices" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "token" text NOT NULL,
      "device_type" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 14. Newsletters
    `CREATE TABLE IF NOT EXISTS "newsletters" (
      "id" text PRIMARY KEY,
      "email" text NOT NULL UNIQUE,
      "status" text DEFAULT 'subscribed' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 15. FAQ
    `CREATE TABLE IF NOT EXISTS "faq" (
      "id" text PRIMARY KEY,
      "question" text NOT NULL,
      "answer" text NOT NULL,
      "category" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 16. Support Tickets
    `CREATE TABLE IF NOT EXISTS "support_tickets" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "subject" text NOT NULL,
      "status" text DEFAULT 'open' NOT NULL,
      "priority" text DEFAULT 'normal' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 17. Support Messages
    `CREATE TABLE IF NOT EXISTS "support_messages" (
      "id" text PRIMARY KEY,
      "ticket_id" text NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "message_text" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 18. Analytics Snapshots
    `CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
      "id" text PRIMARY KEY,
      "metric_name" text NOT NULL,
      "metric_value" integer NOT NULL,
      "snapshot_date" timestamp DEFAULT now() NOT NULL
    );`
  ];

  for (const q of queries) {
    try {
      await sql.query(q);
      console.log("Executed query successfully.");
    } catch (e: any) {
      console.error("Query failed:", e.message);
    }
  }

  console.log("All Phase 6 tables initialized successfully.");
}

run();
