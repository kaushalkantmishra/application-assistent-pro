import { db } from "./index"
import {
  corporateJobs,
  governmentJobs,
  interviewQuestions,
  readingMaterials,
  interviewers,
  users,
  userProfiles,
  applications,
  chatHistory,
  notifications,
  activityLogs,
  settings,
  favorites,
  recentSearches,
} from "./schema"

async function main() {
  console.log("Starting database seeding...")

  try {
    // 1. Clean up existing tables to ensure a clean state
    console.log("Clearing existing tables...")
    await db.delete(applications)
    await db.delete(userProfiles)
    await db.delete(favorites)
    await db.delete(recentSearches)
    await db.delete(chatHistory)
    await db.delete(notifications)
    await db.delete(activityLogs)
    await db.delete(settings)
    await db.delete(corporateJobs)
    await db.delete(governmentJobs)
    await db.delete(interviewQuestions)
    await db.delete(readingMaterials)
    await db.delete(interviewers)
    // Keep users to prevent breaking active sign-in sessions in dev,
    // but we can clear user profiles and applications.

    console.log("Seeding Corporate Jobs...")
    await db.insert(corporateJobs).values([
      {
        title: "Senior Full-Stack Engineer",
        company: "Stripe",
        location: "San Francisco, CA (Hybrid)",
        type: "Full-time",
        salary: "$165,000 - $210,000",
        postedDate: new Date("2026-06-15"),
        deadline: new Date("2026-08-30"),
        description: "Join the Core Billing team to design, build, and scale billing APIs that power millions of businesses globally. You will work with React, TypeScript, Ruby on Rails, and Go.",
        requirements: ["5+ years of experience with React and TypeScript", "Strong understanding of distributed systems", "Prior experience in Fintech or Payments is a plus"],
        status: "active",
      },
      {
        title: "Frontend Developer (React)",
        company: "Vercel",
        location: "Remote (Global)",
        type: "Full-time",
        salary: "$120,000 - $160,000",
        postedDate: new Date("2026-06-20"),
        deadline: new Date("2026-07-25"),
        description: "Work on the Next.js framework team. Help build the future of the Web by improving developer experience, optimization pipelines, and UI library integrations.",
        requirements: ["Expertise in Next.js, React, and Tailwind CSS", "Deep knowledge of Web Performance APIs", "Contributions to open-source software is highly desired"],
        status: "active",
      },
      {
        title: "Staff Product Manager",
        company: "Google",
        location: "Mountain View, CA",
        type: "Full-time",
        salary: "$210,000 - $280,000",
        postedDate: new Date("2026-06-10"),
        deadline: new Date("2026-08-15"),
        description: "Lead product strategy and execution for Gemini Developers Platform. Define the roadmap for SDKs, developer portal, and integration workflows.",
        requirements: ["8+ years of product management experience", "Background in developer tools or API platforms", "BS/MS in Computer Science or equivalent practical experience"],
        status: "active",
      },
      {
        title: "Machine Learning Engineer",
        company: "OpenAI",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$190,000 - $260,000",
        postedDate: new Date("2026-06-22"),
        deadline: new Date("2026-09-01"),
        description: "Train, evaluate, and deploy next-generation foundational models. Research optimizations for transformer training pipelines at scale.",
        requirements: ["Solid understanding of PyTorch and deep learning architectures", "Experience with distributed training (DeepSpeed, Megatron-LM)", "Track record of publications at NeurIPS, ICML, or CVPR"],
        status: "active",
      },
      {
        title: "Data Analyst",
        company: "Netflix",
        location: "Los Gatos, CA (Hybrid)",
        type: "Full-time",
        salary: "$110,000 - $145,000",
        postedDate: new Date("2026-06-18"),
        deadline: new Date("2026-07-30"),
        description: "Partner with content development teams to analyze viewership data, optimize marketing spend, and predict content performance.",
        requirements: ["Proficiency in SQL and Python/R", "Experience with Tableau or similar visualization tools", "Strong storytelling and communication skills using data"],
        status: "active",
      },
    ])

    console.log("Seeding Government Jobs...")
    await db.insert(governmentJobs).values([
      {
        title: "Scientific Officer (Computer Science)",
        department: "Bhabha Atomic Research Centre (BARC)",
        eligibility: "B.E. / B.Tech / B.Sc (Engineering) in Computer Science with minimum 60% aggregate marks",
        location: "Mumbai, Maharashtra",
        lastDate: new Date("2026-08-10"),
        applyLink: "https://barconlineexam.gov.in",
        vacancies: 25,
      },
      {
        title: "Assistant Manager (Information Technology)",
        department: "National Bank for Agriculture and Rural Development (NABARD)",
        eligibility: "Bachelor's Degree in Computer Science / IT / Computer Applications with 60% marks",
        location: "New Delhi, Delhi",
        lastDate: new Date("2026-07-28"),
        applyLink: "https://nabard.org/careers",
        vacancies: 15,
      },
      {
        title: "Scientist 'B' (IT/CS)",
        department: "National Informatics Centre (NIC)",
        eligibility: "B.E/B.Tech in Computer Science / IT / Electronics & Communication",
        location: "All India (Transferable)",
        lastDate: new Date("2026-08-20"),
        applyLink: "https://calicut.nielit.in/nic",
        vacancies: 70,
      },
    ])

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

    console.log("Seeding Reading Materials...")
    await db.insert(readingMaterials).values([
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
    ])

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
        isActive: true,
        joinedDate: new Date("2024-03-15"),
      },
    ])

    console.log("Seeding Applications...")
    await db.insert(applications).values([
      {
        company: "Stripe",
        role: "Senior Full-Stack Engineer",
        status: "Interview Scheduled",
        appliedDate: new Date("2026-06-16"),
        deadline: new Date("2026-07-15"),
        location: "San Francisco, CA (Hybrid)",
        salary: "$165,000 - $210,000",
        notes: "Technical interview scheduled with Sarah Jenkins on Stripe Billing team.",
      },
      {
        company: "Vercel",
        role: "Frontend Developer (React)",
        status: "Applied",
        appliedDate: new Date("2026-06-21"),
        deadline: new Date("2026-07-25"),
        location: "Remote (Global)",
        salary: "$120,000 - $160,000",
        notes: "Next.js team role. Reached out to recruiter via Twitter/X.",
      },
      {
        company: "Google",
        role: "Staff Product Manager",
        status: "Offer Received",
        appliedDate: new Date("2026-06-11"),
        deadline: new Date("2026-08-15"),
        location: "Mountain View, CA",
        salary: "$210,000 - $280,000",
        notes: "Received verbal offer. Negotiation phase on equity package.",
      },
      {
        company: "Netflix",
        role: "Data Analyst",
        status: "Rejected",
        appliedDate: new Date("2026-06-19"),
        location: "Los Gatos, CA (Hybrid)",
        salary: "$110,000 - $145,000",
        notes: "Role closed. Received standard rejection email.",
      },
    ])

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error)
    process.exit(1)
  }
}

main()
