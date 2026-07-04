"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AppLoader } from "@/components/app-loader"
import { Play, Sparkles, History, BrainCircuit, Calendar, Award, Star, Compass, Trash2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface ResumeOption {
  id: string
  title: string
}

interface InterviewSession {
  id: string
  targetRole: string
  technology: string
  difficulty: string
  interviewType: string
  overallScore: number | null
  status: string
  createdAt: string
}

export default function AIMockLobby() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  
  // Wizard toggle
  const [showWizard, setShowWizard] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Configuration wizard state
  const [targetRole, setTargetRole] = useState("Frontend Engineer")
  const [technology, setTechnology] = useState("React, TypeScript")
  const [difficulty, setDifficulty] = useState("Medium")
  const [experienceLevel, setExperienceLevel] = useState("1-3 Years")
  const [interviewType, setInterviewType] = useState("Technical Interview")
  const [duration, setDuration] = useState("30")
  const [language, setLanguage] = useState("English")
  const [companyType, setCompanyType] = useState("Product Based Companies")
  const [companyName, setCompanyName] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState("none")

  useEffect(() => {
    // Load past sessions and resumes
    Promise.all([
      fetch("/api/ai-interviews").then(res => res.json()),
      fetch("/api/resumes").then(res => res.json())
    ]).then(([sessionsData, resumesData]) => {
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      setResumes(Array.isArray(resumesData) ? resumesData : [])
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [])

  const handleStartInterview = async () => {
    if (!targetRole.trim() || !technology.trim()) {
      toast.error("Please provide a target role and technologies")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/ai-interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: targetRole.trim(),
          technology: technology.trim(),
          difficulty,
          experienceLevel,
          interviewType,
          duration: parseInt(duration),
          language,
          companyType,
          companyName: companyName.trim() || null,
          jobDescription: jobDescription.trim() || null,
          resumeId: selectedResumeId !== "none" ? selectedResumeId : null,
        }),
      })

      if (res.ok) {
        const session = await res.json()
        toast.success("AI interview session prepared! Starting now...")
        router.push(`/ai-mock-interview/${session.id}`)
      } else {
        const err = await res.json()
        throw new Error(err.error || "Failed to create session")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session history?")) return
    try {
      const res = await fetch(`/api/ai-interviews?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setSessions(sessions.filter(s => s.id !== id))
        toast.success("Session deleted successfully")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return <AppLoader message="Retrieving AI Interview workspace configurations" />
  }

  return (
    <div className="space-y-6 font-sans text-xs max-w-6xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader
          title="AI Mock Interview Sandbox"
          description="Practice unlimited live assessment simulations tailored to your tech stack, resume, and target difficulty"
        />
        {!showWizard && (
          <Button
            onClick={() => setShowWizard(true)}
            className="bg-indigo-600 hover:bg-indigo-755 text-white font-bold gap-1.5 px-4 h-9.5 rounded-lg shadow-sm cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Start AI Interview
          </Button>
        )}
      </div>

      {showWizard ? (
        <Card className="shadow-md border-indigo-100 overflow-hidden animate-in fade-in-50 duration-200">
          <CardHeader className="pb-4 border-b bg-indigo-50/10">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <BrainCircuit className="h-4.5 w-4.5 text-indigo-650" /> Configure Your Session
            </CardTitle>
            <CardDescription className="text-xs">Customize the interview parameters. AI will dynamically compile specific questions based on these preferences.</CardDescription>
          </CardHeader>
          <CardContent className="py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Target Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Target Role</Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer, DevOps Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="text-xs h-9.5"
              />
            </div>

            {/* Core Technologies */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Core Technologies / Stack</Label>
              <Input
                placeholder="e.g. React, TypeScript, GraphQL, Node.js"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="text-xs h-9.5"
              />
            </div>

            {/* Interview Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="Technical Interview" className="text-xs">Technical Interview</SelectItem>
                  <SelectItem value="System Design" className="text-xs">System Design</SelectItem>
                  <SelectItem value="DSA / Problem Solving" className="text-xs">DSA / Problem Solving</SelectItem>
                  <SelectItem value="Behavioral Interview" className="text-xs">Behavioral Interview</SelectItem>
                  <SelectItem value="HR Interview" className="text-xs">HR Interview</SelectItem>
                  <SelectItem value="Low Level Design" className="text-xs">Low Level Design (LLD)</SelectItem>
                  <SelectItem value="High Level Design" className="text-xs">High Level Design (HLD)</SelectItem>
                  <SelectItem value="Leadership" className="text-xs">Leadership / Managerial</SelectItem>
                  <SelectItem value="Custom Interview" className="text-xs">Custom Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Experience Level</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="Fresher" className="text-xs">Fresher (Entry Level)</SelectItem>
                  <SelectItem value="0-1 Years" className="text-xs">0-1 Years</SelectItem>
                  <SelectItem value="1-3 Years" className="text-xs">1-3 Years</SelectItem>
                  <SelectItem value="3-5 Years" className="text-xs">3-5 Years</SelectItem>
                  <SelectItem value="5-8 Years" className="text-xs">5-8 Years</SelectItem>
                  <SelectItem value="8+ Years" className="text-xs">8+ Years (Principal / Lead)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Difficulty Rating</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="Easy" className="text-xs">Easy</SelectItem>
                  <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="Hard" className="text-xs">Hard</SelectItem>
                  <SelectItem value="Expert" className="text-xs">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Interview Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="15" className="text-xs">15 minutes (Quick Screen)</SelectItem>
                  <SelectItem value="30" className="text-xs">30 minutes (Standard)</SelectItem>
                  <SelectItem value="45" className="text-xs">45 minutes (Detailed)</SelectItem>
                  <SelectItem value="60" className="text-xs">60 minutes (Comprehensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Company Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Target Company Type</Label>
              <Select value={companyType} onValueChange={setCompanyType}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="Product Based Companies" className="text-xs">Product Based (e.g. FAANG, SaaS)</SelectItem>
                  <SelectItem value="Service Based Companies" className="text-xs">Service Based (e.g. Accenture, TCS)</SelectItem>
                  <SelectItem value="Early Stage Startups" className="text-xs">Early Stage / Fast Growth Startups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Target Company Name (Optional)</Label>
              <Input
                placeholder="e.g. Google, Stripe, Netflix"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="text-xs h-9.5"
              />
            </div>

            {/* Target Language */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="English" className="text-xs">English</SelectItem>
                  <SelectItem value="Hindi" className="text-xs">Hindi</SelectItem>
                  <SelectItem value="Spanish" className="text-xs">Spanish</SelectItem>
                  <SelectItem value="French" className="text-xs">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resume Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-650">Link Existing Resume (Optional)</Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger className="text-xs h-9.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="none" className="text-xs">Don't link resume</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Description */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-650">Job Description text (Optional)</Label>
              <Textarea
                placeholder="Paste the target job description details to align questions directly with position requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="text-xs leading-relaxed"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 py-3 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowWizard(false)} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={handleStartInterview}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5 h-9"
            >
              {submitting ? "Preparing AI Workspace..." : "Start AI Interview"} <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Grid: Past Sessions List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-slate-500" /> Past AI Simulations
            </h3>

            {sessions.length === 0 ? (
              <div className="text-center py-16 border border-dashed rounded-xl bg-slate-50/50">
                <BrainCircuit className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-xs">No Mock Practice Found</h4>
                <p className="text-slate-500 mt-1">Configure your first simulation to start training with AI.</p>
                <Button onClick={() => setShowWizard(true)} className="mt-4 text-xs h-9 bg-primary text-white font-bold gap-1">
                  <Play className="h-3.5 w-3.5 fill-current" /> Launch First Session
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((s) => (
                  <Card key={s.id} className="shadow-sm border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden">
                    <CardHeader className="pb-2.5">
                      <div className="flex justify-between items-start gap-1 flex-wrap">
                        <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold text-[9px]">
                          {s.interviewType}
                        </Badge>
                        <span className="text-[10px] text-slate-450 flex items-center gap-0.5"><Calendar className="h-3.5 w-3.5" /> {new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="text-sm font-bold text-slate-800 mt-2 truncate">
                        {s.targetRole}
                      </CardTitle>
                      <CardDescription className="text-[10.5px] truncate">
                        Technologies: {s.technology}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2.5 border-t border-b flex justify-between items-center">
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium text-[10px] block">DIFFICULTY</span>
                        <span className="font-bold text-slate-700">{s.difficulty}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 font-medium text-[10px] block">OVERALL SCORE</span>
                        {s.overallScore !== null ? (
                          <span className="font-bold text-emerald-600 text-sm flex items-center justify-end gap-0.5">
                            {s.overallScore}/100 <Star className="h-4 w-4 fill-emerald-600" />
                          </span>
                        ) : (
                          <span className="text-amber-600 text-[10px] font-bold uppercase">{s.status === "in_progress" ? "In Progress" : "Pending"}</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="py-2.5 bg-slate-50/50 flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSession(s.id)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-650 cursor-pointer shrink-0 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      {s.status === "completed" ? (
                        <Button
                          onClick={() => router.push(`/ai-mock-interview/${s.id}/report`)}
                          className="text-[10.5px] h-8 bg-indigo-600 text-white font-bold gap-1 cursor-pointer rounded-lg"
                        >
                          <Award className="h-3.5 w-3.5" /> View Scorecard
                        </Button>
                      ) : (
                        <Button
                          onClick={() => router.push(`/ai-mock-interview/${s.id}`)}
                          className="text-[10.5px] h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 cursor-pointer rounded-lg"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Resume Practice
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Achievements / Info (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border border-slate-100 bg-gradient-to-br from-indigo-900 to-slate-950 text-white overflow-hidden relative">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <BrainCircuit className="h-40 w-40" />
              </div>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="h-4.5 w-4.5 text-indigo-400" /> Premium Benefits</CardTitle>
                <CardDescription className="text-xs text-indigo-200">Attend unlimited AI Mock simulations to build muscle memory before actual interviews.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <Badge className="bg-emerald-600 text-white h-5 shrink-0 font-bold text-[9px]">UNLIMITED</Badge>
                  <p className="text-[10.5px] leading-relaxed text-slate-200">Practice text, code compilations, and dynamic follow-ups with zero limits.</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-600 text-white h-5 shrink-0 font-bold text-[9px]">ATS ALIGN</Badge>
                  <p className="text-[10.5px] leading-relaxed text-slate-200">Questions auto-adapt to match your linked resume and target position key phrases.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
