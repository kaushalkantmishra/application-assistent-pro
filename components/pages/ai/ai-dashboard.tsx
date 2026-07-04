"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLoader } from "@/components/app-loader"
import {
  Sparkles,
  FileText,
  BrainCircuit,
  Mail,
  LineChart,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

interface Resume {
  id: string;
  title: string;
}

export default function AiDashboard() {
  const [data, setData] = useState<any>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  // ATS Scanner launcher state
  const [scanResumeId, setScanResumeId] = useState<string>("none")
  const [scanning, setScanning] = useState(false)
  const [scannerResult, setScannerResult] = useState<any>(null)

  const fetchDashboardData = async () => {
    try {
      const [histRes, resRes] = await Promise.all([
        fetch("/api/ai/history"),
        fetch("/api/resumes"),
      ])

      if (histRes.ok) setData(await histRes.json())
      if (resRes.ok) {
        const resList = await resRes.json()
        setResumes(resList)
        if (resList.length > 0) {
          setScanResumeId(resList[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRunAtsScanner = async () => {
    if (scanResumeId === "none") {
      toast.error("Please select a resume first")
      return
    }

    try {
      setScanning(true)
      setScannerResult(null)
      const res = await fetch("/api/ai/ats-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: scanResumeId }),
      })

      if (res.ok) {
        const resultReport = await res.json()
        setScannerResult(resultReport.reportJson)
        toast.success("ATS Analysis completed!")
        fetchDashboardData() // Reload history statistics
      }
    } catch (e) {
      console.error(e)
    } finally {
      setScanning(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="py-24">
        <AppLoader message="Retrieving AI Assistant activities and report metrics" />
      </div>
    )
  }

  // Calculate statistics
  const resumeReportsCount = data.resumeReports?.length || 0
  const standaloneAtsCount = data.standaloneAts?.length || 0
  const roadmapsCount = data.roadmaps?.length || 0
  const coverLettersCount = data.coverLetters?.length || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Career Assistant Workspace"
        description="Monitor resume match scores, standalone ATS evaluations, tailored cover letters, and learning roadmaps"
      />

      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold text-slate-550 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Optimizations Run
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-800">{resumeReportsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-slate-400">
            Resumes tailored to job descriptions.
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold text-slate-550 flex items-center gap-1">
              <LineChart className="h-3.5 w-3.5 text-indigo-550" /> Standalone ATS Runs
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-800">{standaloneAtsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-slate-400">
            ATS parsing audits executed.
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold text-slate-550 flex items-center gap-1">
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-500" /> Learning Roadmaps
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-800">{roadmapsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-slate-400">
            Milestone learning schedules.
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold text-slate-550 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-indigo-500" /> Cover Letters generated
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-800">{coverLettersCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-[10px] text-slate-400">
            Company-tailored cover letter logs.
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Left Grid: ATS Scan Launcher & Roadmaps */}
        <div className="lg:col-span-8 space-y-6">
          {/* Standing ATS Scan Launcher */}
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> Standalone ATS Scanner
              </CardTitle>
              <CardDescription className="text-xs">
                Select one of your saved resumes to run an ATS audit. Identify density, formatting errors, and missing keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={scanResumeId} onValueChange={setScanResumeId}>
                  <SelectTrigger className="flex-1 text-xs h-9.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map(r => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">📄 {r.title}</SelectItem>
                    ))}
                    {resumes.length === 0 && <SelectItem value="none" className="text-xs">No resumes available</SelectItem>}
                  </SelectContent>
                </Select>
                <Button onClick={handleRunAtsScanner} disabled={scanning || resumes.length === 0} className="text-xs h-9.5 cursor-pointer bg-primary text-white font-bold px-4 shrink-0">
                  {scanning ? "Evaluating ATS..." : "Analyze ATS"}
                </Button>
              </div>

              {/* Show inline scanner results if completed */}
              {scannerResult && (
                <div className="mt-4 p-4 border rounded-lg bg-indigo-50/15 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-800">ATS Audit Report</span>
                    <Badge className="bg-indigo-600 text-white font-bold text-[10px]">Score: {scannerResult.atsScore}/100</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 block">Missing Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {scannerResult.missingKeywords?.slice(0, 5).map((kw: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[9px] font-bold">{kw}</Badge>
                        ))}
                        {(!scannerResult.missingKeywords || scannerResult.missingKeywords.length === 0) && (
                          <span className="text-[10px] text-slate-400">None detected</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-700 block">Formatting Issues:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-500">
                        {scannerResult.formattingIssues?.slice(0, 3).map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                        {(!scannerResult.formattingIssues || scannerResult.formattingIssues.length === 0) && (
                          <span className="text-[10px] text-slate-400">0 styling issues</span>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matches lists */}
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-850">Recent Tailored Resume Runs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {data.resumeReports.map((rep: any) => {
                  const dateStr = new Date(rep.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })
                  return (
                    <div key={rep.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-800 block truncate">ATS Optimization Report</span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-450">
                          <span>Updated {dateStr}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-700 block">Match: {rep.matchScore}%</span>
                          <span className="text-[10px] text-indigo-650 font-bold block mt-0.5">ATS: {rep.atsScore}</span>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                          <Link href={`/resumes/${rep.resumeId}/edit`}>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {data.resumeReports.length === 0 && (
                  <span className="text-xs text-slate-400 block text-center py-8">No matching report history available.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Grid: Career Roadmaps & Saved suggestions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-850 flex items-center gap-1">
                <BrainCircuit className="h-4.5 w-4.5 text-indigo-650" /> Career Learning Roadmaps
              </CardTitle>
              <CardDescription className="text-xs">
                Review tailored milestones for designations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {data.roadmaps.map((rm: any) => {
                  const dateStr = new Date(rm.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })
                  return (
                    <div key={rm.id} className="p-3.5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-800 block truncate">{rm.targetRole} Roadmap</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Generated {dateStr}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 text-indigo-600 font-bold" asChild>
                        <Link href="/ai-advisor">
                          View
                        </Link>
                      </Button>
                    </div>
                  )
                })}

                {data.roadmaps.length === 0 && (
                  <span className="text-xs text-slate-400 block text-center py-6">No roadmaps generated yet.</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick link button to chat advisor */}
          <Card className="shadow-sm border border-indigo-150 bg-indigo-50/15 overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-[140px]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-750 uppercase tracking-wider block">Interactive Career advisor</span>
                <p className="text-[11px] text-slate-550 leading-relaxed">
                  Start an interactive, streaming chat with the advisor to rewrite descriptions or plan certifications.
                </p>
              </div>
              <Button size="sm" asChild className="text-xs font-bold cursor-pointer w-full bg-indigo-650 hover:bg-indigo-700 text-white mt-2">
                <Link href="/ai-advisor">
                  Start Chat Session <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
