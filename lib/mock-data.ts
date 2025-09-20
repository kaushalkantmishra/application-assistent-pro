export interface Application {
  id: string
  company: string
  role: string
  status: "Applied" | "Interview Scheduled" | "Offer Received" | "Rejected" | "Saved"
  appliedDate: string
  deadline?: string
  location: string
  salary?: string
  notes?: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Remote"
  salary?: string
  postedDate: string
  deadline: string
  description: string
  requirements: string[]
}

export interface GovtJob {
  id: string
  title: string
  department: string
  eligibility: string
  location: string
  lastDate: string
  applyLink: string
  vacancies: number
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  preferredRoles: string[]
  preferredCompanies: string[]
  preferredLocations: string[]
  education: string
  experience: string
  skills: string[]
  resumeFileName?: string
}

export interface InterviewQuestion {
  id: string
  category: "Technical" | "Behavioral" | "Company-Specific" | "General"
  question: string
  sampleAnswer: string
  tips: string[]
}

export interface InterviewTip {
  id: string
  category: "Before Interview" | "During Interview" | "After Interview"
  title: string
  description: string
  importance: "High" | "Medium" | "Low"
}

export interface ReadingMaterial {
  id: string
  title: string
  category: "DSA" | "System Design" | "HR Questions" | "Aptitude" | "Resume Tips" | "Behavioral" | "Technical"
  type: "Article" | "Video" | "Course" | "Book" | "Practice"
  url: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedTime: string
  author?: string
  rating: number
}

export interface InterviewerProfile {
  id: string
  name: string
  email: string
  company: string
  role: string
  department: string
  experience: number
  specializations: string[]
  bio: string
  avatar?: string
  rating: number
  totalInterviews: number
  availability: {
    days: string[]
    timeSlots: string[]
  }
  interviewTypes: ("Technical" | "Behavioral" | "System Design" | "HR")[]
  linkedIn?: string
  github?: string
  isActive: boolean
  joinedDate: string
}

export interface InterviewSession {
  id: string
  interviewerId: string
  candidateId: string
  scheduledDate: string
  duration: number
  type: "Technical" | "Behavioral" | "System Design" | "HR"
  status: "Scheduled" | "Completed" | "Cancelled" | "In Progress"
  feedback?: string
  rating?: number
  notes?: string
  meetingLink?: string
}

// Mock data
export const mockApplications: Application[] = [
  {
    id: "1",
    company: "Google",
    role: "Software Engineer",
    status: "Interview Scheduled",
    appliedDate: "2024-01-15",
    deadline: "2024-01-25",
    location: "Mountain View, CA",
    salary: "$120,000 - $180,000",
    notes: "Technical interview scheduled for next week",
  },
  {
    id: "2",
    company: "Microsoft",
    role: "Frontend Developer",
    status: "Applied",
    appliedDate: "2024-01-10",
    location: "Seattle, WA",
    salary: "$110,000 - $160,000",
  },
  {
    id: "3",
    company: "Apple",
    role: "iOS Developer",
    status: "Offer Received",
    appliedDate: "2024-01-05",
    location: "Cupertino, CA",
    salary: "$130,000 - $190,000",
    notes: "Offer expires in 5 days",
  },
  {
    id: "4",
    company: "Meta",
    role: "Full Stack Developer",
    status: "Rejected",
    appliedDate: "2024-01-01",
    location: "Menlo Park, CA",
    salary: "$125,000 - $175,000",
  },
  {
    id: "5",
    company: "Netflix",
    role: "Senior Software Engineer",
    status: "Saved",
    appliedDate: "2024-01-20",
    location: "Los Gatos, CA",
    salary: "$140,000 - $200,000",
  },
]

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "Stripe",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$130,000 - $180,000",
    postedDate: "2024-01-20",
    deadline: "2024-02-20",
    description: "Join our team to build the future of online payments",
    requirements: ["React", "TypeScript", "Node.js", "5+ years experience"],
  },
  {
    id: "2",
    title: "DevOps Engineer",
    company: "Airbnb",
    location: "Remote",
    type: "Remote",
    salary: "$120,000 - $170,000",
    postedDate: "2024-01-18",
    deadline: "2024-02-18",
    description: "Help scale our infrastructure to millions of users",
    requirements: ["AWS", "Kubernetes", "Docker", "Python"],
  },
  {
    id: "3",
    title: "Product Manager",
    company: "Uber",
    location: "New York, NY",
    type: "Full-time",
    salary: "$140,000 - $190,000",
    postedDate: "2024-01-15",
    deadline: "2024-02-15",
    description: "Lead product strategy for our mobility platform",
    requirements: ["Product Management", "Analytics", "Leadership", "MBA preferred"],
  },
]

export const mockGovtJobs: GovtJob[] = [
  {
    id: "1",
    title: "Software Developer",
    department: "Department of Technology",
    eligibility: "Bachelor's in Computer Science",
    location: "Washington, DC",
    lastDate: "2024-02-15",
    applyLink: "#",
    vacancies: 5,
  },
  {
    id: "2",
    title: "Data Analyst",
    department: "Census Bureau",
    eligibility: "Bachelor's in Statistics or related field",
    location: "Maryland",
    lastDate: "2024-02-20",
    applyLink: "#",
    vacancies: 3,
  },
  {
    id: "3",
    title: "Cybersecurity Specialist",
    department: "Department of Homeland Security",
    eligibility: "Bachelor's in Cybersecurity + Security Clearance",
    location: "Virginia",
    lastDate: "2024-02-25",
    applyLink: "#",
    vacancies: 8,
  },
]

export const mockUserProfile: UserProfile = {
  name: "John Doe",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  preferredRoles: ["Software Engineer", "Frontend Developer", "Full Stack Developer"],
  preferredCompanies: ["Google", "Apple", "Microsoft", "Meta"],
  preferredLocations: ["San Francisco, CA", "Seattle, WA", "Remote"],
  education: "Bachelor's in Computer Science from UC Berkeley",
  experience: "5+ years in software development",
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
  resumeFileName: "john_doe_resume.pdf",
}

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: "1",
    category: "Technical",
    question: "Explain the difference between let, const, and var in JavaScript.",
    sampleAnswer:
      "var is function-scoped and can be redeclared, let is block-scoped and can be reassigned but not redeclared, const is block-scoped and cannot be reassigned or redeclared. const should be used for values that won't change, let for variables that will change, and var should generally be avoided in modern JavaScript.",
    tips: ["Provide concrete examples for each", "Mention hoisting behavior", "Discuss block vs function scoping"],
  },
  {
    id: "2",
    category: "Behavioral",
    question: "Tell me about a time when you had to work with a difficult team member.",
    sampleAnswer:
      "I once worked with a colleague who was resistant to code reviews. I approached them privately to understand their concerns, explained the benefits of peer review, and suggested we start with smaller, less critical changes. Over time, they became more receptive and our code quality improved significantly.",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on your actions and problem-solving",
      "Show empathy and professionalism",
    ],
  },
  {
    id: "3",
    category: "Company-Specific",
    question: "Why do you want to work at our company?",
    sampleAnswer:
      "I'm impressed by your company's commitment to innovation and user-centric design. Your recent product launches show a clear understanding of market needs, and I'm excited about the opportunity to contribute to projects that have real impact on users' lives. The collaborative culture and emphasis on continuous learning align perfectly with my career goals.",
    tips: [
      "Research the company thoroughly",
      "Mention specific products, values, or recent news",
      "Connect your skills to their needs",
    ],
  },
  {
    id: "4",
    category: "General",
    question: "What are your salary expectations?",
    sampleAnswer:
      "Based on my research of the market rate for this position and my experience level, I'm looking for a salary in the range of $X to $Y. However, I'm open to discussing the complete compensation package, including benefits and growth opportunities.",
    tips: [
      "Research market rates beforehand",
      "Give a range rather than a specific number",
      "Consider the total compensation package",
    ],
  },
  {
    id: "5",
    category: "Technical",
    question: "How would you optimize a slow-loading web page?",
    sampleAnswer:
      "I'd start by analyzing the performance using tools like Chrome DevTools or Lighthouse. Common optimizations include: minimizing HTTP requests, optimizing images, enabling compression, using CDNs, minimizing CSS/JS files, implementing lazy loading, and optimizing database queries if applicable.",
    tips: [
      "Mention specific tools and metrics",
      "Prioritize optimizations by impact",
      "Consider both frontend and backend optimizations",
    ],
  },
  {
    id: "6",
    category: "Behavioral",
    question: "Describe a challenging project you worked on and how you overcame obstacles.",
    sampleAnswer:
      "I led a project to migrate our legacy system to a modern architecture. We faced tight deadlines and resistance to change. I created a detailed migration plan, set up regular stakeholder meetings, and implemented the changes incrementally to minimize disruption. The project was completed on time and resulted in 40% improved performance.",
    tips: [
      "Choose a project that shows leadership and problem-solving",
      "Quantify the results when possible",
      "Highlight your specific contributions",
    ],
  },
]

export const mockInterviewTips: InterviewTip[] = [
  {
    id: "1",
    category: "Before Interview",
    title: "Research the Company Thoroughly",
    description:
      "Study the company's mission, values, recent news, products, and competitors. Check their social media and recent press releases.",
    importance: "High",
  },
  {
    id: "2",
    category: "Before Interview",
    title: "Prepare Your STAR Stories",
    description:
      "Have 3-5 stories ready using the Situation, Task, Action, Result framework to answer behavioral questions.",
    importance: "High",
  },
  {
    id: "3",
    category: "Before Interview",
    title: "Practice Technical Questions",
    description:
      "Review common technical questions for your role and practice coding problems on platforms like LeetCode or HackerRank.",
    importance: "High",
  },
  {
    id: "4",
    category: "During Interview",
    title: "Ask Thoughtful Questions",
    description:
      "Prepare 5-7 questions about the role, team, company culture, and growth opportunities to show your genuine interest.",
    importance: "High",
  },
  {
    id: "5",
    category: "During Interview",
    title: "Use the STAR Method",
    description:
      "Structure your behavioral answers with Situation, Task, Action, and Result to provide clear, comprehensive responses.",
    importance: "Medium",
  },
  {
    id: "6",
    category: "During Interview",
    title: "Show Enthusiasm and Energy",
    description:
      "Maintain good eye contact, smile genuinely, and show enthusiasm for the role and company throughout the interview.",
    importance: "Medium",
  },
  {
    id: "7",
    category: "After Interview",
    title: "Send a Thank You Email",
    description:
      "Send a personalized thank you email within 24 hours, reiterating your interest and highlighting key discussion points.",
    importance: "High",
  },
  {
    id: "8",
    category: "After Interview",
    title: "Follow Up Appropriately",
    description:
      "If you don't hear back within the expected timeframe, send a polite follow-up email to check on the status.",
    importance: "Medium",
  },
]

export const mockReadingMaterials: ReadingMaterial[] = [
  // DSA Resources
  {
    id: "1",
    title: "LeetCode - Algorithm Practice",
    category: "DSA",
    type: "Practice",
    url: "https://leetcode.com",
    description: "Practice coding problems with detailed solutions and explanations",
    difficulty: "Intermediate",
    estimatedTime: "Ongoing",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Cracking the Coding Interview",
    category: "DSA",
    type: "Book",
    url: "#",
    description: "Comprehensive guide to technical interviews with 189 programming questions",
    difficulty: "Intermediate",
    estimatedTime: "20 hours",
    author: "Gayle Laakmann McDowell",
    rating: 4.9,
  },
  {
    id: "3",
    title: "Big O Notation Explained",
    category: "DSA",
    type: "Article",
    url: "#",
    description: "Understanding time and space complexity analysis",
    difficulty: "Beginner",
    estimatedTime: "30 minutes",
    rating: 4.7,
  },

  // System Design Resources
  {
    id: "4",
    title: "System Design Interview Course",
    category: "System Design",
    type: "Course",
    url: "#",
    description: "Complete course covering scalable system design principles",
    difficulty: "Advanced",
    estimatedTime: "15 hours",
    author: "Alex Xu",
    rating: 4.8,
  },
  {
    id: "5",
    title: "Designing Data-Intensive Applications",
    category: "System Design",
    type: "Book",
    url: "#",
    description: "Deep dive into distributed systems and data architecture",
    difficulty: "Advanced",
    estimatedTime: "40 hours",
    author: "Martin Kleppmann",
    rating: 4.9,
  },
  {
    id: "6",
    title: "System Design Primer",
    category: "System Design",
    type: "Article",
    url: "#",
    description: "GitHub repository with system design concepts and examples",
    difficulty: "Intermediate",
    estimatedTime: "5 hours",
    rating: 4.8,
  },

  // HR Questions Resources
  {
    id: "7",
    title: "50 Common Interview Questions",
    category: "HR Questions",
    type: "Article",
    url: "#",
    description: "Most frequently asked HR questions with sample answers",
    difficulty: "Beginner",
    estimatedTime: "2 hours",
    rating: 4.6,
  },
  {
    id: "8",
    title: "Behavioral Interview Mastery",
    category: "Behavioral",
    type: "Video",
    url: "#",
    description: "Video series on answering behavioral questions using STAR method",
    difficulty: "Intermediate",
    estimatedTime: "3 hours",
    rating: 4.7,
  },

  // Resume Tips Resources
  {
    id: "9",
    title: "Resume Writing Guide 2024",
    category: "Resume Tips",
    type: "Article",
    url: "#",
    description: "Modern resume writing techniques and ATS optimization",
    difficulty: "Beginner",
    estimatedTime: "1 hour",
    rating: 4.5,
  },
  {
    id: "10",
    title: "Tech Resume Templates",
    category: "Resume Tips",
    type: "Practice",
    url: "#",
    description: "Professional resume templates for software engineers",
    difficulty: "Beginner",
    estimatedTime: "30 minutes",
    rating: 4.4,
  },

  // Aptitude Resources
  {
    id: "11",
    title: "Quantitative Aptitude Practice",
    category: "Aptitude",
    type: "Practice",
    url: "#",
    description: "Math and logical reasoning problems for technical interviews",
    difficulty: "Intermediate",
    estimatedTime: "Ongoing",
    rating: 4.3,
  },
  {
    id: "12",
    title: "Logical Reasoning Fundamentals",
    category: "Aptitude",
    type: "Course",
    url: "#",
    description: "Course covering logical reasoning and problem-solving techniques",
    difficulty: "Beginner",
    estimatedTime: "8 hours",
    rating: 4.5,
  },

  // Technical Resources
  {
    id: "13",
    title: "JavaScript Interview Questions",
    category: "Technical",
    type: "Article",
    url: "#",
    description: "Comprehensive list of JavaScript concepts for interviews",
    difficulty: "Intermediate",
    estimatedTime: "4 hours",
    rating: 4.6,
  },
  {
    id: "14",
    title: "React Interview Preparation",
    category: "Technical",
    type: "Video",
    url: "#",
    description: "Video series covering React concepts and common interview questions",
    difficulty: "Intermediate",
    estimatedTime: "6 hours",
    rating: 4.7,
  },
]

export const mockInterviewerProfiles: InterviewerProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    company: "TechCorp",
    role: "Senior Software Engineer",
    department: "Engineering",
    experience: 8,
    specializations: ["React", "Node.js", "System Design", "JavaScript"],
    bio: "Passionate about mentoring junior developers and helping candidates showcase their best skills. I focus on creating a comfortable interview environment while thoroughly assessing technical capabilities.",
    avatar: "/professional-woman-software-engineer.png",
    rating: 4.8,
    totalInterviews: 156,
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      timeSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
    },
    interviewTypes: ["Technical", "System Design"],
    linkedIn: "https://linkedin.com/in/sarahchen",
    github: "https://github.com/sarahchen",
    isActive: true,
    joinedDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael.r@innovate.com",
    company: "Innovate Solutions",
    role: "Engineering Manager",
    department: "Engineering",
    experience: 12,
    specializations: ["Leadership", "Team Management", "System Architecture", "Python"],
    bio: "I believe in fair and comprehensive interviews that help candidates demonstrate their potential. My approach combines technical assessment with understanding of collaborative skills.",
    avatar: "/professional-man-engineering-manager.jpg",
    rating: 4.9,
    totalInterviews: 203,
    availability: {
      days: ["Tuesday", "Wednesday", "Thursday", "Friday"],
      timeSlots: ["10:00 AM", "1:00 PM", "3:00 PM"],
    },
    interviewTypes: ["Technical", "Behavioral", "System Design"],
    linkedIn: "https://linkedin.com/in/michaelrodriguez",
    isActive: true,
    joinedDate: "2022-08-20",
  },
  {
    id: "3",
    name: "Emily Watson",
    email: "emily.watson@dataflow.com",
    company: "DataFlow Inc",
    role: "HR Director",
    department: "Human Resources",
    experience: 10,
    specializations: ["Behavioral Interviews", "Culture Fit", "Communication Skills"],
    bio: "Specializing in behavioral interviews and cultural fit assessment. I help candidates feel at ease while evaluating their soft skills and alignment with company values.",
    avatar: "/placeholder-rvylo.png",
    rating: 4.7,
    totalInterviews: 189,
    availability: {
      days: ["Monday", "Wednesday", "Thursday", "Friday"],
      timeSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "5:00 PM"],
    },
    interviewTypes: ["Behavioral", "HR"],
    linkedIn: "https://linkedin.com/in/emilywatson",
    isActive: true,
    joinedDate: "2023-03-10",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@cloudtech.com",
    company: "CloudTech Systems",
    role: "Principal Architect",
    department: "Engineering",
    experience: 15,
    specializations: ["System Design", "Cloud Architecture", "Scalability", "Microservices"],
    bio: "Expert in system design interviews with focus on scalable architectures. I enjoy helping candidates think through complex problems and design robust solutions.",
    avatar: "/placeholder-jron3.png",
    rating: 4.9,
    totalInterviews: 127,
    availability: {
      days: ["Monday", "Tuesday", "Friday"],
      timeSlots: ["10:00 AM", "2:00 PM", "4:00 PM"],
    },
    interviewTypes: ["System Design", "Technical"],
    linkedIn: "https://linkedin.com/in/davidkim",
    github: "https://github.com/davidkim",
    isActive: true,
    joinedDate: "2022-11-05",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa.t@startup.com",
    company: "StartupXYZ",
    role: "CTO",
    department: "Executive",
    experience: 18,
    specializations: ["Leadership", "Strategic Thinking", "Full Stack", "Startup Culture"],
    bio: "As a CTO, I focus on assessing both technical skills and entrepreneurial mindset. I help candidates understand what it takes to thrive in a fast-paced startup environment.",
    avatar: "/placeholder-zmyxe.png",
    rating: 4.8,
    totalInterviews: 94,
    availability: {
      days: ["Tuesday", "Thursday"],
      timeSlots: ["11:00 AM", "3:00 PM"],
    },
    interviewTypes: ["Technical", "Behavioral", "System Design"],
    linkedIn: "https://linkedin.com/in/lisathompson",
    isActive: true,
    joinedDate: "2023-06-01",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "james.wilson@fintech.com",
    company: "FinTech Solutions",
    role: "Senior Data Scientist",
    department: "Data Science",
    experience: 7,
    specializations: ["Machine Learning", "Python", "Statistics", "Data Analysis"],
    bio: "Passionate about data science and machine learning. I conduct interviews that assess both theoretical knowledge and practical problem-solving skills in data science.",
    avatar: "/professional-data-scientist.png",
    rating: 4.6,
    totalInterviews: 78,
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      timeSlots: ["9:00 AM", "1:00 PM", "3:00 PM"],
    },
    interviewTypes: ["Technical"],
    linkedIn: "https://linkedin.com/in/jameswilson",
    github: "https://github.com/jameswilson",
    isActive: true,
    joinedDate: "2023-09-15",
  },
]

export const mockInterviewSessions: InterviewSession[] = [
  {
    id: "1",
    interviewerId: "1",
    candidateId: "user1",
    scheduledDate: "2024-01-25T10:00:00Z",
    duration: 60,
    type: "Technical",
    status: "Scheduled",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    interviewerId: "2",
    candidateId: "user1",
    scheduledDate: "2024-01-20T14:00:00Z",
    duration: 45,
    type: "Behavioral",
    status: "Completed",
    feedback: "Great communication skills and problem-solving approach. Shows strong leadership potential.",
    rating: 4,
    notes: "Candidate demonstrated excellent STAR method usage and provided concrete examples.",
  },
  {
    id: "3",
    interviewerId: "3",
    candidateId: "user2",
    scheduledDate: "2024-01-28T11:00:00Z",
    duration: 30,
    type: "HR",
    status: "Scheduled",
    meetingLink: "https://zoom.us/j/123456789",
  },
]
