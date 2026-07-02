import { neon } from "@neondatabase/serverless";

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    return;
  }
  const sql = neon(url);

  console.log("Starting database table creation...");

  const queries = [
    // 1. AI Interview Sessions
    `CREATE TABLE IF NOT EXISTS "ai_interview_sessions" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "target_role" text NOT NULL,
      "technology" text NOT NULL,
      "difficulty" text NOT NULL,
      "experience_level" text NOT NULL,
      "interview_type" text NOT NULL,
      "duration" integer NOT NULL,
      "language" text NOT NULL,
      "company_type" text NOT NULL,
      "company_name" text,
      "job_description" text,
      "resume_text" text,
      "status" text DEFAULT 'pending' NOT NULL,
      "overall_score" integer,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 2. AI Interview Questions
    `CREATE TABLE IF NOT EXISTS "ai_interview_questions" (
      "id" text PRIMARY KEY,
      "session_id" text NOT NULL REFERENCES "ai_interview_sessions"("id") ON DELETE CASCADE,
      "question_text" text NOT NULL,
      "question_type" text NOT NULL,
      "options" jsonb,
      "expected_answer" text,
      "code_template" text,
      "test_cases" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 3. AI Interview Answers
    `CREATE TABLE IF NOT EXISTS "ai_interview_answers" (
      "id" text PRIMARY KEY,
      "question_id" text NOT NULL REFERENCES "ai_interview_questions"("id") ON DELETE CASCADE,
      "answer_text" text NOT NULL,
      "correctness_score" integer DEFAULT 0 NOT NULL,
      "confidence_score" integer DEFAULT 0 NOT NULL,
      "communication_score" integer DEFAULT 0 NOT NULL,
      "technical_score" integer DEFAULT 0 NOT NULL,
      "feedback" text,
      "hints" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 4. AI Interview Reports
    `CREATE TABLE IF NOT EXISTS "ai_interview_reports" (
      "id" text PRIMARY KEY,
      "session_id" text NOT NULL REFERENCES "ai_interview_sessions"("id") ON DELETE CASCADE,
      "overall_score" integer NOT NULL,
      "technical_score" integer NOT NULL,
      "communication_score" integer NOT NULL,
      "confidence_score" integer NOT NULL,
      "coding_score" integer NOT NULL,
      "behavioral_score" integer NOT NULL,
      "problem_solving_score" integer NOT NULL,
      "system_design_score" integer NOT NULL,
      "grammar_score" integer NOT NULL,
      "recommendation" text NOT NULL,
      "roadmap" jsonb,
      "study_resources" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 5. Coding Submissions
    `CREATE TABLE IF NOT EXISTS "coding_submissions" (
      "id" text PRIMARY KEY,
      "session_id" text NOT NULL REFERENCES "ai_interview_sessions"("id") ON DELETE CASCADE,
      "question_id" text NOT NULL REFERENCES "ai_interview_questions"("id") ON DELETE CASCADE,
      "code" text NOT NULL,
      "language" text NOT NULL,
      "status" text NOT NULL,
      "compilation_output" text,
      "test_cases_passed" integer DEFAULT 0 NOT NULL,
      "total_test_cases" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 6. Wallets
    `CREATE TABLE IF NOT EXISTS "wallets" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "balance" integer DEFAULT 0 NOT NULL,
      "currency" text DEFAULT 'USD' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 7. Wallet Transactions
    `CREATE TABLE IF NOT EXISTS "wallet_transactions" (
      "id" text PRIMARY KEY,
      "wallet_id" text NOT NULL REFERENCES "wallets"("id") ON DELETE CASCADE,
      "amount" integer NOT NULL,
      "type" text NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "description" text,
      "reference_id" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 8. Subscription Plans
    `CREATE TABLE IF NOT EXISTS "subscription_plans" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "code" text NOT NULL,
      "price" integer NOT NULL,
      "billing_interval" text NOT NULL,
      "limit_interviews" integer NOT NULL,
      "limit_resumes" integer NOT NULL,
      "limit_ats" integer NOT NULL,
      "limit_cover_letters" integer NOT NULL,
      "features" jsonb DEFAULT '[]'::jsonb,
      "is_active" boolean DEFAULT true NOT NULL
    );`,

    // 9. Subscriptions
    `CREATE TABLE IF NOT EXISTS "subscriptions" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "plan_id" text NOT NULL REFERENCES "subscription_plans"("id") ON DELETE CASCADE,
      "status" text DEFAULT 'active' NOT NULL,
      "current_period_start" timestamp NOT NULL,
      "current_period_end" timestamp NOT NULL,
      "cancel_at_period_end" boolean DEFAULT false NOT NULL,
      "razorpay_subscription_id" text,
      "invoice_url" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 10. Payments
    `CREATE TABLE IF NOT EXISTS "payments" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "amount" integer NOT NULL,
      "currency" text DEFAULT 'USD' NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "provider" text NOT NULL,
      "transaction_id" text,
      "reference_id" text,
      "coupon_code" text,
      "discount_amount" integer DEFAULT 0 NOT NULL,
      "net_amount" integer NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 11. Coupons
    `CREATE TABLE IF NOT EXISTS "coupons" (
      "id" text PRIMARY KEY,
      "code" text NOT NULL UNIQUE,
      "discount_percentage" integer,
      "discount_amount" integer,
      "max_redemptions" integer,
      "current_redemptions" integer DEFAULT 0 NOT NULL,
      "expires_at" timestamp,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 12. Coupon Usages
    `CREATE TABLE IF NOT EXISTS "coupon_usages" (
      "id" text PRIMARY KEY,
      "coupon_id" text NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "payment_id" text REFERENCES "payments"("id") ON DELETE SET NULL,
      "used_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 13. Referrals
    `CREATE TABLE IF NOT EXISTS "referrals" (
      "id" text PRIMARY KEY,
      "referrer_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "referred_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "referral_code" text NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 14. Referral Rewards
    `CREATE TABLE IF NOT EXISTS "referral_rewards" (
      "id" text PRIMARY KEY,
      "referral_id" text NOT NULL REFERENCES "referrals"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "credits_awarded" integer NOT NULL,
      "status" text DEFAULT 'pending' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 15. Achievements
    `CREATE TABLE IF NOT EXISTS "achievements" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "description" text NOT NULL,
      "icon" text NOT NULL,
      "type" text NOT NULL,
      "points_awarded" integer NOT NULL
    );`,

    // 16. User Achievements
    `CREATE TABLE IF NOT EXISTS "user_achievements" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "achievement_id" text NOT NULL REFERENCES "achievements"("id") ON DELETE CASCADE,
      "unlocked_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 17. Leaderboards
    `CREATE TABLE IF NOT EXISTS "leaderboards" (
      "id" text PRIMARY KEY,
      "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" text NOT NULL,
      "category" text NOT NULL,
      "score" integer NOT NULL,
      "rank" integer,
      "updated_at" timestamp DEFAULT now() NOT NULL
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

  console.log("All tables initialized successfully.");
}

run();
