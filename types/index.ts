export interface Application {
  id: string
  company: string
  role: string
  status: "Applied" | "Interview Scheduled" | "Offer Received" | "Rejected" | "Saved"
  appliedDate: string
  deadline?: string | null
  location: string
  salary?: string | null
  notes?: string | null
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Remote"
  salary?: string | null
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
  resumeFileName?: string | null
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
  author?: string | null
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
  avatar?: string | null
  rating: number
  totalInterviews: number
  availability: {
    days: string[]
    timeSlots: string[]
  }
  interviewTypes: ("Technical" | "Behavioral" | "System Design" | "HR")[]
  linkedIn?: string | null
  github?: string | null
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
  feedback?: string | null
  rating?: number | null
  notes?: string | null
  meetingLink?: string | null
}
