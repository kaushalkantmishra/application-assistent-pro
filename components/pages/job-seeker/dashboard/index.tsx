"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Mail, 
  Code, 
  BookOpen, 
  Sparkles, 
  Flame, 
  ArrowRight,
  Plus, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { AppLoader } from "@/components/app-loader"

interface ResumeItem {
  id: string
  title: string
  updatedAt: string
}

interface CoverLetterItem {
  id: string
  companyName?: string | null
  jobRole?: string | null
  createdAt: string
}

interface CodingProfile {
  id: string
  provider: string
  url: string
  username?: string | null
}

interface ProgressItem {
  id: string
  completed: boolean
}

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([])
  const [codingProfiles, setCodingProfiles] = useState<CodingProfile[]>([])
  const [progressList, setProgressList] = useState<ProgressItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/users/profile").then((res) => res.ok ? res.json() : null),
      fetch("/api/resumes").then((res) => res.ok ? res.json() : []),
      fetch("/api/cover-letters").then((res) => res.ok ? res.json() : []),
      fetch("/api/coding-profiles").then((res) => res.ok ? res.json() : []),
      fetch("/api/learning-progress").then((res) => res.ok ? res.json() : []),
    ])
      .then(([profileData, resumesData, clData, cpData, progData]) => {
        setProfile(profileData)
        setResumes(resumesData || [])
        setCoverLetters(clData || [])
        setCodingProfiles(cpData || [])
        setProgressList(progData || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load dashboard statistics:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <AppLoader message="Assembling your career dashboard" />
  }

  const userName = profile?.name ? profile.name.split(" ")[0] : "Developer"
  
  // Calculate completion percentage metrics
  const hasGithub = codingProfiles.some(p => p.provider === "github")
  const hasLinkedin = codingProfiles.some(p => p.provider === "linkedin")
  const hasLeetcode = codingProfiles.some(p => p.provider === "leetcode")
  const completedGuidesCount = progressList.filter(p => p.completed).length

  let readinessScore = 20 // Base score for creating account
  if (profile?.about) readinessScore += 15
  if (profile?.skills && profile.skills.length > 0) readinessScore += 15
  if (resumes.length > 0) readinessScore += 15
  if (hasGithub) readinessScore += 10
  if (hasLinkedin) readinessScore += 10
  if (hasLeetcode) readinessScore += 10
  if (completedGuidesCount > 0) readinessScore += 5
  readinessScore = Math.min(readinessScore, 100)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${userName}!`}
        description="Your centralized command center to become interview-ready and manage developer credentials."
      >
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-primary text-white cursor-pointer gap-1.5">
            <Link href="/resumes">
              <Plus className="h-4 w-4" /> New Resume
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="cursor-pointer gap-1.5">
            <Link href="/cover-letters">
              <Plus className="h-4 w-4" /> Cover Letter
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Resumes Built</CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{resumes.length}</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Ready for custom target applications</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cover Letters</CardTitle>
            <Mail className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{coverLetters.length}</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Tailored using generative AI models</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Connected Profiles</CardTitle>
            <Code className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{codingProfiles.length} / 10</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Developer identities centralized</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Completed Guides</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completedGuidesCount}</div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">DSA, Systems and HR materials read</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Readiness Index & Action Hub */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-indigo-150 dark:border-indigo-900 bg-indigo-50/5 dark:bg-indigo-950/10 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-28 h-28 bg-indigo-100/30 rounded-full blur-2xl" />
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-indigo-650 dark:text-indigo-400" /> Career Readiness Index</CardTitle>
              <CardDescription className="text-xs">Aggregate rating of your profile strength & materials study status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-750 dark:text-indigo-300">{readinessScore}%</span>
                <Badge className="bg-indigo-600 text-white font-bold text-[9px] uppercase">
                  {readinessScore >= 80 ? "Excellent" : readinessScore >= 50 ? "Moderate" : "Beginner"}
                </Badge>
              </div>
              <Progress value={readinessScore} className="h-2 bg-indigo-100 dark:bg-indigo-950" />
              <p className="text-[10px] text-indigo-650/80 dark:text-indigo-300/80 leading-relaxed mt-2">
                Connect your Github, Leetcode, and LinkedIn accounts and complete at least 2 study guides to score above 80%.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Direct paths to essential modules</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/resumes">
                  <span>Open Resume Builder</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/cover-letters">
                  <span>Generate Cover Letter</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/coding-profiles">
                  <span>Connect Developer Portals</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/study-materials">
                  <span>Start DSA / System Guides</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profiles Status & Recent Resumes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Coding Profile Verification Status */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Developer Account Integrations</CardTitle>
              <CardDescription className="text-xs">Centralized status of external platforms</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "github", label: "GitHub" },
                { id: "linkedin", label: "LinkedIn" },
                { id: "leetcode", label: "LeetCode" },
                { id: "geeksforgeeks", label: "GeeksforGeeks" },
                { id: "portfolio", label: "Portfolio" },
                { id: "website", label: "Website" },
              ].map(item => {
                const connected = codingProfiles.some(p => p.provider === item.id)
                return (
                  <div key={item.id} className="p-3 border rounded-lg bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{item.label}</span>
                    {connected ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-605 fill-emerald-50 dark:fill-emerald-950 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent Drafts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Recent Resumes & Cover Letters</CardTitle>
              <CardDescription className="text-xs">Quick access to your draft documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumes.length > 0 || coverLetters.length > 0 ? (
                <div className="space-y-2.5">
                  {resumes.slice(0, 2).map(r => (
                    <div key={r.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.title}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Updated {new Date(r.updatedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs cursor-pointer pl-2">
                        <Link href={`/resumes/${r.id}/edit`}>Edit Resume <ExternalLink className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  ))}
                  {coverLetters.slice(0, 2).map(cl => (
                    <div key={cl.id} className="p-3 border rounded-lg flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-500" />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{cl.jobRole || "Open Position"} - {cl.companyName || "Company"}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Generated {new Date(cl.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs cursor-pointer pl-2">
                        <Link href="/cover-letters">View Letter <ExternalLink className="h-3 w-3 ml-1" /></Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 border border-dashed rounded-lg bg-slate-50/10 dark:bg-slate-900/10">
                  <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2 animate-pulse" />
                  No documents found. Start by creating a resume or cover letter.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}