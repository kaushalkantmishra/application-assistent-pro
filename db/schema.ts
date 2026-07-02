import { pgTable, text, timestamp, integer, primaryKey, uuid, boolean, real, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "@auth/core/adapters"

// ----------------------------------------------------
// NEXTAUTH SCHEMA
// ----------------------------------------------------

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("job_seeker"), // "job_seeker" | "interviewer" | "admin"
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// ----------------------------------------------------
// USER PROFILE SCHEMA (JOB SEEKER)
// ----------------------------------------------------

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  phone: text("phone"),
  location: text("location"),
  about: text("about"),
  currentDesignation: text("current_designation"),
  yearsOfExperience: integer("years_of_experience").default(0),
  currentCompany: text("current_company"),
  currentSalary: text("current_salary"),
  expectedSalary: text("expected_salary"),
  preferredIndustry: text("preferred_industry"),
  preferredWorkMode: text("preferred_work_mode"), // "Remote" | "Hybrid" | "On-site"
  preferredLocations: jsonb("preferred_locations").default([]).$type<string[]>(),
  languages: jsonb("languages").default([]).$type<string[]>(),
  education: text("education"),
  experience: text("experience"),
  skills: jsonb("skills").default([]).$type<string[]>(),
  preferredRoles: jsonb("preferred_roles").default([]).$type<string[]>(),
  preferredCompanies: jsonb("preferred_companies").default([]).$type<string[]>(),
  
  // Social/Coding links (direct references on profile)
  github: text("github"),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  leetcode: text("leetcode"),
  geeksforgeeks: text("geeksforgeeks"),
  codechef: text("codechef"),
  codeforces: text("codeforces"),
  hackerrank: text("hackerrank"),
  hackerearth: text("hackerearth"),
  website: text("website"),

  resumeFileName: text("resume_file_name"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

// ----------------------------------------------------
// CODING PROFILES SCHEMA
// ----------------------------------------------------

export const codingProfiles = pgTable("coding_profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'github' | 'linkedin' | 'leetcode' | 'geeksforgeeks' | 'codechef' | 'codeforces' | 'hackerrank' | 'hackerearth' | 'portfolio' | 'website'
  url: text("url").notNull(),
  username: text("username"),
  status: text("status").default("connected").notNull(), // 'connected' | 'syncing' | 'error'
  lastSyncedAt: timestamp("last_synced_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// INTERVIEWERS SCHEMA
// ----------------------------------------------------

export const interviewers = pgTable("interviewers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role"), // designation
  department: text("department"),
  experience: integer("experience"),
  specializations: jsonb("specializations").default([]).$type<string[]>(),
  bio: text("bio"),
  avatar: text("avatar"),
  rating: real("rating").default(5.0),
  totalInterviews: integer("total_interviews").default(0),
  availability: jsonb("availability").default({ days: [], timeSlots: [] }).$type<{ days: string[]; timeSlots: string[] }>(),
  interviewTypes: jsonb("interview_types").default([]).$type<string[]>(),
  
  // Pricing/Details
  pricingType: text("pricing_type").default("free").notNull(), // "free" | "paid"
  hourlyCharges: integer("hourly_charges").default(0).notNull(),
  verificationStatus: text("verification_status").default("pending").notNull(), // "pending" | "verified" | "rejected"
  languages: jsonb("languages").default([]).$type<string[]>(),
  interviewCategories: jsonb("interview_categories").default([]).$type<string[]>(),

  linkedIn: text("linkedin"),
  github: text("github"),
  portfolio: text("portfolio"),
  isActive: boolean("is_active").default(true),
  joinedDate: timestamp("joined_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

// ----------------------------------------------------
// INTERVIEW PREPARATION SCHEMA
// ----------------------------------------------------

export const interviewQuestions = pgTable("interview_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category"), // 'Technical' | 'Behavioral' | 'Company-Specific' | 'General'
  question: text("question").notNull(),
  sampleAnswer: text("sample_answer"),
  tips: jsonb("tips").default([]).$type<string[]>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

// ----------------------------------------------------
// STUDY MATERIALS SCHEMA
// ----------------------------------------------------

export const readingMaterials = pgTable("reading_materials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  category: text("category"), // 'DSA' | 'System Design' | 'HR Questions' | 'Aptitude' | 'Resume Tips' | 'Behavioral' | 'Technical'
  type: text("type"), // 'Article' | 'Video' | 'Course' | 'Book' | 'Practice'
  url: text("url"),
  description: text("description"),
  difficulty: text("difficulty"), // 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: text("estimated_time"),
  author: text("author"),
  rating: real("rating"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

// ----------------------------------------------------
// LEARNING PATHS & PROGRESS
// ----------------------------------------------------

export const learningPaths = pgTable("learning_paths", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'Frontend' | 'Backend' | 'React' | 'Next.js' | 'Node.js' | 'DSA' | 'System Design' | 'Behavioral' | 'HR' | 'Aptitude'
  difficulty: text("difficulty").default("Beginner").notNull(), // 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: text("estimated_time"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const learningProgress = pgTable("learning_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  materialId: text("material_id").notNull(), // references reading_materials.id
  completed: boolean("completed").default(false).notNull(),
  progress: integer("progress").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// GENERIC BOOKMARKS SCHEMA (REPLACING FAVORITES)
// ----------------------------------------------------

export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // 'study_material' | 'interview_question' | 'resume_template' | 'article' | 'video'
  itemId: text("item_id").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// CHAT HISTORY SCHEMA
// ----------------------------------------------------

export const chatHistory = pgTable("chat_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  category: text("category"), // 'resume' | 'interview' | 'application' | 'salary' | 'networking' | 'skills' | 'general'
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

// ----------------------------------------------------
// NOTIFICATIONS SCHEMA
// ----------------------------------------------------

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  message: text("message"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
})

// ----------------------------------------------------
// ACTIVITY LOGS SCHEMA
// ----------------------------------------------------

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// SETTINGS SCHEMA
// ----------------------------------------------------

export const settings = pgTable("settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("light"),
  emailNotifications: boolean("email_notifications").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// RECENT SEARCHES SCHEMA
// ----------------------------------------------------

export const recentSearches = pgTable("recent_searches", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// USER STATISTICS SCHEMA
// ----------------------------------------------------

export const userStatistics = pgTable("user_statistics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  resumeCount: integer("resume_count").default(0).notNull(),
  coverLetterCount: integer("cover_letter_count").default(0).notNull(),
  interviewsCount: integer("interviews_count").default(0).notNull(),
  studyProgressPercent: integer("study_progress_percent").default(0).notNull(),
  learningStreak: integer("learning_streak").default(0).notNull(),
  aiUsageCount: integer("ai_usage_count").default(0).notNull(),
  profileCompletionPercent: integer("profile_completion_percent").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ----------------------------------------------------
// RESUMES SCHEMA
// ----------------------------------------------------

export const resumes = pgTable(
  "resumes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    templateId: text("template_id").default("modern").notNull(),
    themeId: text("theme_id").default("default").notNull(),
    resumeJson: jsonb("resume_json").notNull(),
    status: text("status").default("draft").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (table) => ({
    userIdIdx: index("resumes_user_id_idx").on(table.userId),
    deletedAtIdx: index("resumes_deleted_at_idx").on(table.deletedAt),
  })
)

// ----------------------------------------------------
// AI OPTIMIZER & COVER LETTER MODULE SCHEMA
// ----------------------------------------------------

export const tblJobDescriptions = pgTable(
  "tbl_job_descriptions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: text("company_name"),
    jobRole: text("job_role"),
    jobDescriptionText: text("job_description_text").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("job_desc_user_id_idx").on(table.userId),
  })
)

export const tblAiResumeAnalysis = pgTable(
  "tbl_ai_resume_analysis",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobDescriptionId: text("job_description_id")
      .notNull()
      .references(() => tblJobDescriptions.id, { onDelete: "cascade" }),
    overallMatchScore: integer("overall_match_score").notNull(),
    technicalMatchPercent: integer("technical_match_percent").notNull(),
    experienceMatchPercent: integer("experience_match_percent").notNull(),
    skillsMatchPercent: integer("skills_match_percent").notNull(),
    educationMatchPercent: integer("education_match_percent").notNull(),
    keywordMatchPercent: integer("keyword_match_percent").notNull(),
    atsScore: integer("ats_score").notNull(),
    analysisJson: jsonb("analysis_json").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("analysis_user_id_idx").on(table.userId),
    resumeIdIdx: index("analysis_resume_id_idx").on(table.resumeId),
  })
)

export const tblCoverLetters = pgTable(
  "tbl_cover_letters",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobDescriptionId: text("job_description_id")
      .references(() => tblJobDescriptions.id, { onDelete: "set null" }),
    companyName: text("company_name"),
    hiringManager: text("hiring_manager"),
    jobRole: text("job_role"),
    tone: text("tone"),
    length: text("length"),
    coverLetterText: text("cover_letter_text").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("cover_letters_user_id_idx").on(table.userId),
    resumeIdIdx: index("cover_letters_resume_id_idx").on(table.resumeId),
  })
)

export const tblAiHistory = pgTable(
  "tbl_ai_history",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobDescriptionId: text("job_description_id")
      .references(() => tblJobDescriptions.id, { onDelete: "set null" }),
    originalResumeJson: jsonb("original_resume_json").notNull(),
    optimizedResumeJson: jsonb("optimized_resume_json").notNull(),
    jobTitle: text("job_title"),
    companyName: text("company_name"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("ai_history_user_id_idx").on(table.userId),
    resumeIdIdx: index("ai_history_resume_id_idx").on(table.resumeId),
  })
)
