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

// ----------------------------------------------------
// RESUME ECOSYSTEM TABLES (PHASE 2)
// ----------------------------------------------------

export const resumeFolders = pgTable("resume_folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const resumeTags = pgTable("resume_tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const resumeFolderMappings = pgTable("resume_folder_mapping", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  folderId: text("folder_id")
    .notNull()
    .references(() => resumeFolders.id, { onDelete: "cascade" }),
})

export const resumeTagMappings = pgTable("resume_tag_mapping", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => resumeTags.id, { onDelete: "cascade" }),
})

export const resumeVersions = pgTable("resume_versions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  versionName: text("version_name").notNull(),
  resumeJson: jsonb("resume_json").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const resumeContentLibrary = pgTable("resume_content_library", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(), // 'summary' | 'objective' | 'project' | 'achievement' | 'skill' | 'certificate' | 'experience'
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const coverLetterFolders = pgTable("cover_letter_folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const coverLetterTags = pgTable("cover_letter_tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const coverLetterFolderMappings = pgTable("cover_letter_folder_mapping", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  coverLetterId: text("cover_letter_id")
    .notNull()
    .references(() => tblCoverLetters.id, { onDelete: "cascade" }),
  folderId: text("folder_id")
    .notNull()
    .references(() => coverLetterFolders.id, { onDelete: "cascade" }),
})

export const coverLetterTagMappings = pgTable("cover_letter_tag_mapping", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  coverLetterId: text("cover_letter_id")
    .notNull()
    .references(() => tblCoverLetters.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => coverLetterTags.id, { onDelete: "cascade" }),
})

export const coverLetterVersions = pgTable("cover_letter_versions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  coverLetterId: text("cover_letter_id")
    .notNull()
    .references(() => tblCoverLetters.id, { onDelete: "cascade" }),
  versionName: text("version_name").notNull(),
  coverLetterText: text("cover_letter_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const coverLetterTemplates = pgTable("cover_letter_templates", {
  id: text("id").primaryKey(), // 'professional' | 'modern' | 'corporate' | 'minimal' | 'formal' | 'startup' | 'executive'
  name: text("name").notNull(),
  description: text("description"),
  recommendedUse: text("recommended_use"),
})

export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  messages: jsonb("messages").notNull().default([]), // array of {role: 'user'|'assistant', content: string}
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const aiResumeReports = pgTable("ai_resume_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  jobDescriptionId: text("job_description_id"),
  matchScore: integer("match_score").notNull(),
  atsScore: integer("ats_score").notNull(),
  keywordMatchPercent: integer("keyword_match_percent").notNull(),
  technicalMatchPercent: integer("technical_match_percent").notNull(),
  experienceMatchPercent: integer("experience_match_percent").notNull(),
  skillsMatchPercent: integer("skills_match_percent").notNull(),
  educationMatchPercent: integer("education_match_percent").notNull(),
  atsReportJson: jsonb("ats_report_json").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const atsReports = pgTable("ats_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  atsScore: integer("ats_score").notNull(),
  reportJson: jsonb("report_json").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const careerRoadmaps = pgTable("career_roadmaps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetRole: text("target_role").notNull(),
  roadmapJson: jsonb("roadmap_json").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const resumeImprovements = pgTable("resume_improvements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  sectionId: text("section_id").notNull(),
  originalContent: text("original_content").notNull(),
  suggestedContent: text("suggested_content").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'accepted' | 'rejected'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const coverLetterHistory = pgTable("cover_letter_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  jobRole: text("job_role").notNull(),
  coverLetterText: text("cover_letter_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const jobDescriptionLibrary = pgTable("job_description_library", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  descriptionText: text("description_text").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const aiSavedPrompts = pgTable("ai_saved_prompts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  promptText: text("prompt_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const interviewBookings = pgTable("interview_bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  interviewerId: text("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  interviewType: text("interview_type").notNull(), // HR, Technical, System Design, DSA, Behavioral, Mock, etc.
  scheduledDate: timestamp("scheduled_date", { mode: "date" }).notNull(),
  duration: integer("duration").notNull(), // 30, 60, 90, 120 minutes
  status: text("status").default("Pending").notNull(), // Pending, Accepted, Rejected, Cancelled, Completed, Rescheduled, Expired
  notes: text("notes"),
  meetingLink: text("meeting_link"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const interviewerAvailability = pgTable("interviewer_availability", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  interviewerId: text("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  isRecurring: boolean("is_recurring").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const availabilitySlots = pgTable("availability_slots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  interviewerId: text("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  date: timestamp("date", { mode: "date" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status").default("available").notNull(), // available, booked, blocked
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const bookingHistory = pgTable("booking_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .references(() => interviewBookings.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // create, accept, reject, reschedule, cancel
  actorId: text("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const chatRooms = pgTable("chat_rooms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const chatParticipants = pgTable("chat_participants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  roomId: text("room_id")
    .notNull()
    .references(() => chatRooms.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
})

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  roomId: text("room_id")
    .notNull()
    .references(() => chatRooms.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageText: text("message_text").notNull(),
  attachments: jsonb("attachments").default([]), // array of { type: 'image'|'pdf', url: string, name: string }
  isRead: boolean("is_read").default(false).notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const videoMeetings = pgTable("video_meetings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .references(() => interviewBookings.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // Zoom, Google Meet, 100ms, Daily.co
  meetingLink: text("meeting_link").notNull(),
  roomName: text("room_name").notNull(),
  status: text("status").default("scheduled").notNull(), // scheduled, active, ended
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const meetingParticipants = pgTable("meeting_participants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => videoMeetings.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
  leftAt: timestamp("left_at", { mode: "date" }),
})

export const interviewFeedback = pgTable("interview_feedback", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .references(() => interviewBookings.id, { onDelete: "cascade" }),
  interviewerId: text("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  overallRating: integer("overall_rating").notNull(),
  technicalRating: integer("technical_rating").notNull(),
  communication: integer("communication").notNull(),
  problemSolving: integer("problem_solving").notNull(),
  confidence: integer("confidence").notNull(),
  behavior: integer("behavior").notNull(),
  codingSkills: integer("coding_skills").notNull(),
  strengths: text("strengths").notNull(),
  weaknesses: text("weaknesses").notNull(),
  recommendations: text("recommendations").notNull(),
  hiringRecommendation: text("hiring_recommendation").notNull(), // Strong Hire, Hire, Leaning Hire, No Hire
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const interviewReviews = pgTable("interview_reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text("booking_id")
    .notNull()
    .references(() => interviewBookings.id, { onDelete: "cascade" }),
  interviewerId: text("interviewer_id")
    .notNull()
    .references(() => interviewers.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  reviewText: text("review_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const interviewNotifications = pgTable("interview_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // booking_request, accepted, rejected, reminder, feedback, message
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  start: timestamp("start", { mode: "date" }).notNull(),
  end: timestamp("end", { mode: "date" }).notNull(),
  link: text("link"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ==========================================================
// PHASE 5 - AI INTERVIEW, PAYMENT & WALLET SCHEMAS
// ==========================================================

export const aiInterviewSessions = pgTable("ai_interview_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetRole: text("target_role").notNull(),
  technology: text("technology").notNull(),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard, Expert
  experienceLevel: text("experience_level").notNull(), // Fresher, 0-1 Years, 1-3 Years, 3-5 Years, 5-8 Years, 8+ Years
  interviewType: text("interview_type").notNull(), // HR, Technical, Behavioral, Custom, etc.
  duration: integer("duration").notNull(), // in minutes
  language: text("language").notNull(),
  companyType: text("company_type").notNull(),
  companyName: text("company_name"),
  jobDescription: text("job_description"),
  resumeText: text("resume_text"),
  status: text("status").default("pending").notNull(), // pending, in_progress, completed
  overallScore: integer("overall_score"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const aiInterviewQuestions = pgTable("ai_interview_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => aiInterviewSessions.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(), // text, mcq, coding, system_design, behavioral
  options: jsonb("options"), // Array of options for MCQ
  expectedAnswer: text("expected_answer"),
  codeTemplate: text("code_template"),
  testCases: jsonb("test_cases"), // Array of { input, output } for coding question
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const aiInterviewAnswers = pgTable("ai_interview_answers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  questionId: text("question_id")
    .notNull()
    .references(() => aiInterviewQuestions.id, { onDelete: "cascade" }),
  answerText: text("answer_text").notNull(),
  correctnessScore: integer("correctness_score").default(0).notNull(),
  confidenceScore: integer("confidence_score").default(0).notNull(),
  communicationScore: integer("communication_score").default(0).notNull(),
  technicalScore: integer("technical_score").default(0).notNull(),
  feedback: text("feedback"),
  hints: text("hints"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const aiInterviewReports = pgTable("ai_interview_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => aiInterviewSessions.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score").notNull(),
  technicalScore: integer("technical_score").notNull(),
  communicationScore: integer("communication_score").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  codingScore: integer("coding_score").notNull(),
  behavioralScore: integer("behavioral_score").notNull(),
  problemSolvingScore: integer("problem_solving_score").notNull(),
  systemDesignScore: integer("system_design_score").notNull(),
  grammarScore: integer("grammar_score").notNull(),
  recommendation: text("recommendation").notNull(),
  roadmap: jsonb("roadmap"), // array of { step, description }
  studyResources: jsonb("study_resources"), // array of { topic, url }
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const codingSubmissions = pgTable("coding_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => aiInterviewSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => aiInterviewQuestions.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  language: text("language").notNull(),
  status: text("status").notNull(), // pass, fail, compile_error
  compilationOutput: text("compilation_output"),
  testCasesPassed: integer("test_cases_passed").default(0).notNull(),
  totalTestCases: integer("total_test_cases").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const wallets = pgTable("wallets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").default(0).notNull(), // balance in credits/cents
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  walletId: text("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // credit, debit
  status: text("status").default("pending").notNull(), // pending, completed, failed
  description: text("description"),
  referenceId: text("reference_id"), // payment transaction ID or coupon code
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  code: text("code").notNull(), // free, premium, enterprise
  price: integer("price").notNull(), // price in cents
  billingInterval: text("billing_interval").notNull(), // monthly, quarterly, yearly
  limitInterviews: integer("limit_interviews").notNull(),
  limitResumes: integer("limit_resumes").notNull(),
  limitAts: integer("limit_ats").notNull(),
  limitCoverLetters: integer("limit_cover_letters").notNull(),
  features: jsonb("features").default([]),
  isActive: boolean("is_active").default(true).notNull(),
})

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id, { onDelete: "cascade" }),
  status: text("status").default("active").notNull(), // active, cancelled, expired
  currentPeriodStart: timestamp("current_period_start", { mode: "date" }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }).notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  invoiceUrl: text("invoice_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // price in cents
  currency: text("currency").default("USD").notNull(),
  status: text("status").default("pending").notNull(), // pending, captured, failed, refunded
  provider: text("provider").notNull(), // razorpay, stripe, paypal
  transactionId: text("transaction_id"),
  referenceId: text("reference_id"),
  couponCode: text("coupon_code"),
  discountAmount: integer("discount_amount").default(0).notNull(),
  netAmount: integer("net_amount").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  discountPercentage: integer("discount_percentage"),
  discountAmount: integer("discount_amount"), // in cents
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").default(0).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const couponUsages = pgTable("coupon_usages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  couponId: text("coupon_id")
    .notNull()
    .references(() => coupons.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paymentId: text("payment_id")
    .references(() => payments.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at", { mode: "date" }).defaultNow().notNull(),
})

export const referrals = pgTable("referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerId: text("referrer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referredId: text("referred_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referralCode: text("referral_code").notNull(),
  status: text("status").default("pending").notNull(), // pending, completed
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const referralRewards = pgTable("referral_rewards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referralId: text("referral_id")
    .notNull()
    .references(() => referrals.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creditsAwarded: integer("credits_awarded").notNull(),
  status: text("status").default("pending").notNull(), // pending, credited
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(), // first_resume, first_interview, coding_milestone, streak_weekly, streak_monthly
  pointsAwarded: integer("points_awarded").notNull(),
})

export const userAchievements = pgTable("user_achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at", { mode: "date" }).defaultNow().notNull(),
})

export const leaderboards = pgTable("leaderboards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // weekly, monthly, all_time
  category: text("category").notNull(), // learners, interview_scores, coding_scores
  score: integer("score").notNull(),
  rank: integer("rank"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

// ==========================================================
// PHASE 6 - ADMIN, COMMUNITY, & ANALYTICS SCHEMAS
// ==========================================================

export const platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  theme: text("theme").default("dark").notNull(),
  branding: jsonb("branding").default({}),
  seo: jsonb("seo").default({}),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const emailTemplates = pgTable("email_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const blogs = pgTable("blogs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: text("slug").notNull().unique(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const communityPosts = pgTable("community_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  category: text("category").notNull(), // Resume Review, Interview Experience, Coding, Career Advice, General
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const communityComments = pgTable("community_comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  commentText: text("comment_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const communityLikes = pgTable("community_likes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const communityBookmarks = pgTable("community_bookmarks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const communityFollowers = pgTable("community_followers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  followerId: text("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const adminLogs = pgTable("admin_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(), // Suspend, Verify, Approve, ConfigChange
  entityType: text("entity_type").notNull(), // User, Interviewer, PlatformSetting
  entityId: text("entity_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const systemLogs = pgTable("system_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  logLevel: text("log_level").notNull(), // info, warn, error
  message: text("message").notNull(),
  context: jsonb("context").default({}),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const errorLogs = pgTable("error_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  errorName: text("error_name").notNull(),
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const pushNotifications = pgTable("push_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isSent: boolean("is_sent").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const userDevices = pgTable("user_devices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  deviceType: text("device_type").notNull(), // ios, android, web
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const newsletters = pgTable("newsletters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  status: text("status").default("subscribed").notNull(), // subscribed, unsubscribed
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const faq = pgTable("faq", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // Resume, Interview, General, Payment
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const supportTickets = pgTable("support_tickets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  status: text("status").default("open").notNull(), // open, resolved, closed
  priority: text("priority").default("normal").notNull(), // low, normal, high, urgent
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const supportMessages = pgTable("support_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ticketId: text("ticket_id")
    .notNull()
    .references(() => supportTickets.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageText: text("message_text").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  metricName: text("metric_name").notNull(), // dau, mau, revenue_cents, resumes_created
  metricValue: integer("metric_value").notNull(),
  snapshotDate: timestamp("snapshot_date", { mode: "date" }).defaultNow().notNull(),
})




