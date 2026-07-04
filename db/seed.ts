import { db } from "./index"
import {
  interviewQuestions,
  readingMaterials,
  interviewers,
  users,
  userProfiles,
  chatHistory,
  notifications,
  activityLogs,
  settings,
  bookmarks,
  recentSearches,
  codingProfiles,
  learningPaths,
  learningProgress,
  userStatistics,
} from "./schema"

async function main() {
  console.log("Starting database seeding...")

  try {
    // 1. Clean up existing tables to ensure a clean state
    console.log("Clearing existing tables...")
    await db.delete(userProfiles)
    await db.delete(bookmarks)
    await db.delete(recentSearches)
    await db.delete(chatHistory)
    await db.delete(notifications)
    await db.delete(activityLogs)
    await db.delete(settings)
    await db.delete(interviewQuestions)
    await db.delete(readingMaterials)
    await db.delete(interviewers)
    await db.delete(codingProfiles)
    await db.delete(learningPaths)
    await db.delete(learningProgress)
    await db.delete(userStatistics)

    console.log("Seeding Interview Questions...")
    await db.insert(interviewQuestions).values([
      {
        category: "Technical",
        question: "Explain the difference between Server Components and Client Components in React 19.",
        sampleAnswer: "React Server Components (RSC) render on the server, meaning their code is not included in the client-side JavaScript bundle, making them highly performant. They can fetch data directly from databases or APIs. Client Components, marked with 'use client', are hydrated on the client and are used for interactive UI elements (state, effects, browser APIs).",
        tips: ["Mention bundle size reduction benefits", "Explain hydration process", "Highlight when to use RSC vs Client Components"],
      },
      {
        category: "Technical",
        question: "What is the Time and Space Complexity of resolving collisions in a Hash Map using Chaining?",
        sampleAnswer: "For a hash map using Chaining (linked lists or balanced trees at each bucket), the average time complexity for Insert, Delete, and Search is O(1) assuming a uniform distribution (low load factor). In the worst-case (all keys hash to the same bucket), Search becomes O(N) for linked lists or O(log N) for balanced trees. Space complexity is O(N + K) where N is number of elements and K is number of buckets.",
        tips: ["Define load factor", "Explain rehashing", "Differentiate between average and worst-case scenarios"],
      },
      {
        category: "Behavioral",
        question: "Describe a time you had a conflict with a teammate and how you resolved it.",
        sampleAnswer: "Use the STAR method: Situation (describe the team project and the source of conflict, e.g., architecture decisions), Task (the need to align on a direction without delaying milestones), Action (setting up a 1-on-1 meeting to listen to their perspective, listing pros/cons of both approaches objectively, proposing a hybrid compromise or prototyping both), Result (the project was delivered on time, team trust was strengthened, and we established a review framework for future disputes).",
        tips: ["Focus on constructive actions, not complaining", "Highlight active listening and empathy", "Quantify the positive outcome"],
      },
      {
        category: "Company-Specific",
        question: "Google: How would you design a rate limiter for a public API endpoint?",
        sampleAnswer: "To design a distributed rate limiter, I would use Redis to store requests in memory for speed. I would implement either Token Bucket or Leaky Bucket algorithm for smooth traffic, or sliding window log for high precision. I would handle scale by partitioning Redis keys using consistent hashing and using local cache (in-memory) for extremely popular endpoints with fallback synchronization.",
        tips: ["Clarify requirements first (limits, distributed, latency)", "Compare Token Bucket vs Sliding Window", "Mention edge cases like race conditions and atomic operations (Redis Lua scripts)"],
      },
    ])

    console.log("Seeding Reading/Study Materials...")
    const seededMaterials = await db.insert(readingMaterials).values([
      {
        title: "Mastering System Design: Fundamental Concepts",
        category: "System Design",
        type: "Article",
        url: "https://systemdesignprimer.org/fundamentals",
        description: "An in-depth guide covering key concepts in System Design: Load Balancers, Caching strategies, Database Partitioning, CDN, and DNS. Ideal for staff engineer prep.",
        difficulty: "Intermediate",
        estimatedTime: "25 mins",
        author: "Alex Xu",
        rating: 4.8,
      },
      {
        title: "LeetCode 75 Study Plan",
        category: "DSA",
        type: "Practice",
        url: "https://leetcode.com/studyplan/leetcode-75",
        description: "A curated list of 75 essential DSA questions covering Arrays, Sliding Window, Trees, Graphs, and Dynamic Programming. Recommended for tech screen preparation.",
        difficulty: "Beginner",
        estimatedTime: "4 weeks",
        author: "LeetCode Team",
        rating: 4.9,
      },
      {
        title: "Cracking the Behavioral Interview",
        category: "HR Questions",
        type: "Book",
        url: "https://amazon.com/behavioral-interview-prep",
        description: "A framework guide on crafting stories using the STAR method. Includes answers to top 50 behavioral questions and tips on culture fit reviews.",
        difficulty: "Beginner",
        estimatedTime: "5 hours",
        author: "Gayle Laakmann McDowell",
        rating: 4.7,
      },
    ]).returning()

    console.log("Seeding Interviewers...")
    await db.insert(interviewers).values([
      {
        name: "Arjun Mehta",
        email: "arjun@google.com",
        company: "Google",
        role: "Senior Software Engineer",
        department: "Google Cloud Platform",
        experience: 7,
        specializations: ["System Design", "Go", "Kubernetes", "Distributed Systems"],
        bio: "Ex-Amazon. 7+ years of experience building scalable microservices and infrastructure. Love mentoring engineers and conducting Mock System Design reviews.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rating: 4.9,
        totalInterviews: 120,
        availability: {
          days: ["Monday", "Wednesday", "Friday"],
          timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"],
        },
        interviewTypes: ["System Design", "Coding (DSA)", "General Technical Resume Review"],
        linkedIn: "https://linkedin.com/in/arjun-mehta-gcp",
        github: "https://github.com/arjunmehta",
        portfolio: "https://arjunmehta.dev",
        pricingType: "paid",
        hourlyCharges: 120,
        verificationStatus: "verified",
        languages: ["English", "Hindi"],
        interviewCategories: ["System Design", "DSA", "Backend"],
        isActive: true,
        joinedDate: new Date("2024-01-10"),
      },
      {
        name: "Sarah Jenkins",
        email: "sarah@stripe.com",
        company: "Stripe",
        role: "Tech Lead",
        department: "Billing Infrastructure",
        experience: 9,
        specializations: ["React", "TypeScript", "Frontend Architecture", "API Design"],
        bio: "Passionate about web performance, clean API designs, and building rich interactive dashboards. I run frontend mock interviews and CV refinement sessions.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        rating: 4.8,
        totalInterviews: 85,
        availability: {
          days: ["Tuesday", "Thursday"],
          timeSlots: ["1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"],
        },
        interviewTypes: ["Frontend Technical", "React Deep-dive", "Behavioral / Leadership"],
        linkedIn: "https://linkedin.com/in/sarah-jenkins-stripe",
        github: "https://github.com/sjenkins-dev",
        portfolio: "https://sarahjenkins.dev",
        pricingType: "free",
        hourlyCharges: 0,
        verificationStatus: "verified",
        languages: ["English"],
        interviewCategories: ["Frontend", "React", "Next.js", "Behavioral"],
        isActive: true,
        joinedDate: new Date("2024-03-15"),
      },
    ])

    console.log("Seeding Learning Paths...")
    await db.insert(learningPaths).values([
      {
        title: "Frontend Mastery Path",
        description: "Learn how to build premium, state-of-the-art interactive web interfaces from vanilla CSS up to Next.js production deployments.",
        category: "Frontend",
        difficulty: "Intermediate",
        estimatedTime: "25 hours",
      },
      {
        title: "Advanced Data Structures & Algorithms",
        description: "Deep dive into problem solving techniques: arrays, lists, sliding windows, recursion, dynamic programming and systems architecture.",
        category: "DSA",
        difficulty: "Advanced",
        estimatedTime: "40 hours",
      },
      {
        title: "Backend Microservices with Node.js",
        description: "Design microservices, handle REST APIs, configure relational & non-relational database schemas, and optimize backend query latency.",
        category: "Backend",
        difficulty: "Intermediate",
        estimatedTime: "30 hours",
      },
    ])

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error)
    process.exit(1)
  }
}

main()
