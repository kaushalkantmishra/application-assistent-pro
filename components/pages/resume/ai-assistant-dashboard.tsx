"use client"

import { useState, useEffect, useRef } from "react"
import { useResumeStore } from "@/stores/resume-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sparkles,
  Check,
  Loader2,
  Trash2,
  Copy,
  Download,
  History,
  FileText,
  BrainCircuit,
  RefreshCw,
  Search,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react"
import { toast } from "sonner"

interface AiAssistantDashboardProps {
  id: string // Resume ID
}

export default function AiAssistantDashboard({ id: resumeId }: AiAssistantDashboardProps) {
  const { resume, updateResumeJson } = useResumeStore()
  const [activeTab, setActiveTab] = useState<"optimize" | "cover-letter" | "history">("optimize")

  // Shared Job Description Input
  const [jobDescription, setJobDescription] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobRole, setJobRole] = useState("")

  // Loading & Streaming states
  const [analyzing, setAnalyzing] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [generatingLetter, setGeneratingLetter] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Analysis result states
  const [analysisReport, setAnalysisReport] = useState<any>(null)

  // Section Optimization states
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [optimizationMode, setOptimizationMode] = useState<"section" | "entire">("section")
  const [activeOptSection, setActiveOptSection] = useState("")
  const [optExplanation, setOptExplanation] = useState("")
  const [originalResumeJsonBackup, setOriginalResumeJsonBackup] = useState<any>(null)
  const [optimizedResumeJsonBackup, setOptimizedResumeJsonBackup] = useState<any>(null)

  // Cover Letter states
  const [hiringManager, setHiringManager] = useState("")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [coverLettersList, setCoverLettersList] = useState<any[]>([])
  const [activeCoverLetter, setActiveCoverLetter] = useState<any>(null)

  // History states
  const [historyList, setHistoryList] = useState<any[]>([])
  const [prevJobDescriptions, setPrevJobDescriptions] = useState<any[]>([])
  const [historySearch, setHistorySearch] = useState("")

  // Fetch history & cover letters on mount or tab change
  useEffect(() => {
    fetchHistoryAndLetters()
  }, [resumeId, activeTab])

  const fetchHistoryAndLetters = async () => {
    try {
      setLoadingHistory(true)
      
      // Get letters
      const lettersRes = await fetch(`/api/resumes/${resumeId}/ai/cover-letters`)
      if (lettersRes.ok) {
        const letters = await lettersRes.json()
        setCoverLettersList(letters)
        if (letters.length > 0 && !activeCoverLetter) {
          setActiveCoverLetter(letters[0])
        }
      }

      // Get history list
      const historyRes = await fetch(`/api/resumes/${resumeId}/ai/history?search=${encodeURIComponent(historySearch)}`)
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistoryList(historyData.history || [])
        setPrevJobDescriptions(historyData.jobDescriptions || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setAnalyzing(false)
      setOptimizing(false)
      setGeneratingLetter(false)
      toast.info("Request cancelled.")
    }
  }

  // 1. Analyze Resume Match
  const handleAnalyzeResume = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste the job description first.")
      return
    }

    setAnalyzing(true)
    setAnalysisReport(null)
    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionText: jobDescription,
          companyName,
          jobRole,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setAnalysisReport(data.report)
      toast.success("Resume analysis completed successfully!")
      fetchHistoryAndLetters()
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Failed to analyze resume.")
      }
    } finally {
      setAnalyzing(false)
      abortControllerRef.current = null
    }
  }

  // 2. Optimize Section
  const handleOptimizeSection = async (sectionId: string) => {
    if (!jobDescription.trim()) {
      toast.error("Please provide a Job Description to guide the AI optimization.")
      return
    }

    setOptimizing(true)
    setActiveOptSection(sectionId)
    setOptimizationMode("section")
    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/optimize-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          jobDescriptionText: jobDescription,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setOptExplanation(data.explanation)
      setOriginalResumeJsonBackup(resume?.resumeJson)

      // Create optimized JSON with just the updated section
      const optimizedJson = {
        ...resume?.resumeJson,
        [sectionId]: data.optimizedSection,
      }
      setOptimizedResumeJsonBackup(optimizedJson)
      setComparisonOpen(true)
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Failed to optimize section.")
      }
    } finally {
      setOptimizing(false)
      abortControllerRef.current = null
    }
  }

  // 3. Optimize Entire Resume
  const handleOptimizeEntireResume = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please provide a Job Description to guide the AI optimization.")
      return
    }

    setOptimizing(true)
    setOptimizationMode("entire")
    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/optimize-full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionText: jobDescription,
          jobTitle: jobRole,
          companyName,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setOptExplanation(data.explanation)
      setOriginalResumeJsonBackup(data.originalResumeJson)
      setOptimizedResumeJsonBackup(data.optimizedResumeJson)
      setComparisonOpen(true)
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Failed to optimize entire resume.")
      }
    } finally {
      setOptimizing(false)
      abortControllerRef.current = null
    }
  }

  // Accept comparison changes
  const handleAcceptOptimization = () => {
    if (optimizedResumeJsonBackup) {
      updateResumeJson(optimizedResumeJsonBackup)
      toast.success(
        optimizationMode === "entire"
          ? "Entire resume optimized successfully!"
          : `Section "${activeOptSection}" optimized successfully!`
      )
      setComparisonOpen(false)
      fetchHistoryAndLetters()
    }
  }

  // 4. Generate Cover Letter
  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please provide a Job Description to generate a cover letter.")
      return
    }

    setGeneratingLetter(true)
    abortControllerRef.current = new AbortController()

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/cover-letters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionText: jobDescription,
          companyName,
          hiringManager,
          jobRole,
          tone,
          length,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const savedLetter = await res.json()
      setActiveCoverLetter(savedLetter)
      toast.success("Cover letter generated successfully!")
      fetchHistoryAndLetters()
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Failed to generate cover letter.")
      }
    } finally {
      setGeneratingLetter(false)
      abortControllerRef.current = null
    }
  }

  // 5. Update / Save Manual Edits on Cover Letter
  const handleSaveCoverLetter = async () => {
    if (!activeCoverLetter) return

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/cover-letters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterId: activeCoverLetter.id,
          coverLetterText: activeCoverLetter.coverLetterText,
        }),
      })

      if (res.ok) {
        toast.success("Cover letter changes saved!")
        fetchHistoryAndLetters()
      } else {
        throw new Error(await res.text())
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save cover letter changes.")
    }
  }

  // Delete Cover Letter
  const handleDeleteCoverLetter = async (letterId: string) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/cover-letters?letterId=${letterId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Cover letter deleted.")
        if (activeCoverLetter?.id === letterId) {
          setActiveCoverLetter(null)
        }
        fetchHistoryAndLetters()
      }
    } catch (err) {
      toast.error("Failed to delete cover letter.")
    }
  }

  // 6. Restore Previous Snapshots
  const handleRestoreCheckpoint = async (historyId: string) => {
    if (!confirm("Are you sure you want to restore your active resume to this version?")) return

    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          historyId,
          type: "optimized",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        updateResumeJson(data.resume.resumeJson)
        toast.success("Resume successfully restored to checkpoint snapshot!")
      } else {
        throw new Error(await res.text())
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to restore checkpoint.")
    }
  }

  // Delete history items
  const handleDeleteHistoryItem = async (historyId?: string, jobDescId?: string) => {
    if (!confirm("Are you sure you want to delete this history item?")) return

    try {
      const query = historyId ? `historyId=${historyId}` : `jobDescId=${jobDescId}`
      const res = await fetch(`/api/resumes/${resumeId}/ai/history?${query}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("History item deleted.")
        fetchHistoryAndLetters()
      }
    } catch (err) {
      toast.error("Failed to delete history item.")
    }
  }

  // Export Tools: Copy, DOCX, PDF
  const copyLetterToClipboard = () => {
    if (!activeCoverLetter) return
    navigator.clipboard.writeText(activeCoverLetter.coverLetterText)
    toast.success("Cover letter copied to clipboard!")
  }

  const downloadLetterDocx = () => {
    if (!activeCoverLetter) return

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Cover Letter</title>
        <style>
          body { font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; line-height: 1.5; color: #000; padding: 1in; }
          p { margin-bottom: 12pt; }
        </style>
      </head>
      <body>
        ${activeCoverLetter.coverLetterText.replace(/\n/g, "<br/>")}
      </body>
      </html>
    `

    const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Cover_Letter_${activeCoverLetter.companyName || "Company"}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("DOCX downloaded successfully!")
  }

  const downloadLetterPdf = () => {
    if (!activeCoverLetter) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter</title>
          <style>
            body { font-family: 'Times New Roman', Georgia, serif; font-size: 11.5pt; line-height: 1.5; padding: 1.2in; color: black; }
            p { margin-bottom: 12pt; text-align: justify; }
          </style>
        </head>
        <body>
          ${activeCoverLetter.coverLetterText.replace(/\n/g, "<br/>")}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
    toast.success("Print/PDF window opened!")
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
      {/* 1. Header with Tab controls */}
      <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
            AI Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Optimize resume & generate targeted cover letters with Gemini</p>
        </div>

        <div className="flex gap-1 bg-slate-200/80 p-0.5 rounded-lg shrink-0 w-fit">
          <button
            onClick={() => setActiveTab("optimize")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "optimize" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Resume Optimizer
          </button>
          <button
            onClick={() => setActiveTab("cover-letter")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "cover-letter" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cover Letter
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "history" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            History & Library
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab 1: Resume Optimizer */}
        {activeTab === "optimize" && (
          <div className="p-4 space-y-6 max-w-4xl mx-auto pb-12">
            {/* JD Input card */}
            <Card className="shadow-sm border-indigo-100">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-bold text-slate-800">Job Details</CardTitle>
                <CardDescription className="text-[11px]">
                  Provide target job details to evaluate match and suggest optimizations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Company Name</Label>
                    <Input
                      placeholder="e.g. Google, TechCorp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Job Role / Title</Label>
                    <Input
                      placeholder="e.g. Senior Software Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Paste Job Description</Label>
                  <Textarea
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="text-xs min-h-[140px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyzeResume}
                    disabled={analyzing || optimizing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-xs gap-1.5 cursor-pointer font-semibold shadow-sm w-full md:w-auto"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="h-3.5 w-3.5" /> Analyze Resume
                      </>
                    )}
                  </Button>

                  {(analyzing || optimizing) && (
                    <Button
                      onClick={cancelRequest}
                      variant="destructive"
                      className="text-xs cursor-pointer"
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Reports */}
            {analysisReport && (
              <div className="space-y-6">
                {/* 1. Scores Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {[
                    { label: "Overall Match", val: analysisReport.overallMatchScore, color: "bg-indigo-500" },
                    { label: "Technical", val: analysisReport.technicalMatchPercent, color: "bg-emerald-500" },
                    { label: "Experience", val: analysisReport.experienceMatchPercent, color: "bg-amber-500" },
                    { label: "Skills", val: analysisReport.skillsMatchPercent, color: "bg-blue-500" },
                    { label: "Education", val: analysisReport.educationMatchPercent, color: "bg-violet-500" },
                    { label: "Keywords", val: analysisReport.keywordMatchPercent, color: "bg-purple-500" },
                    { label: "ATS Score", val: analysisReport.atsScore, color: "bg-rose-500" },
                  ].map((score, i) => (
                    <Card key={i} className="text-center p-3 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight block mb-2">{score.label}</span>
                      <div className="relative inline-flex items-center justify-center">
                        <span className="text-xl font-extrabold text-slate-800">{score.val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${score.color}`} style={{ width: `${score.val}%` }}></div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* 2. Optimization controls */}
                <Card className="border-indigo-100 bg-indigo-50/20">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                      Optimize Resume Sections
                    </CardTitle>
                    <CardDescription className="text-xs text-indigo-700">
                      Improve the wording, ATS compatibility, and phrasing of your resume to match this job description.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "personalInfo", label: "Headline" },
                        { id: "summary", label: "Professional Summary" },
                        { id: "experience", label: "Work Experience" },
                        { id: "projects", label: "Projects" },
                        { id: "technicalSkills", label: "Technical Skills" },
                        { id: "certificates", label: "Certificates" },
                      ].map((sec) => (
                        <Button
                          key={sec.id}
                          onClick={() => handleOptimizeSection(sec.id)}
                          disabled={optimizing || analyzing}
                          variant="outline"
                          className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-900 text-xs font-semibold px-3 py-1 cursor-pointer bg-white"
                        >
                          {optimizing && activeOptSection === sec.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1 text-indigo-500" />
                          )}
                          Optimize {sec.label}
                        </Button>
                      ))}
                    </div>

                    <div className="border-t border-indigo-100/50 pt-3">
                      <Button
                        onClick={handleOptimizeEntireResume}
                        disabled={optimizing || analyzing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold gap-1.5 cursor-pointer w-full md:w-auto"
                      >
                        {optimizing && optimizationMode === "entire" ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Optimizing Resume...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" /> Optimize Entire Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Detailed Feedback Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Missing Elements */}
                  <Card className="shadow-sm border-amber-100">
                    <CardHeader className="py-3 bg-amber-50/50 border-b">
                      <CardTitle className="text-xs font-bold text-amber-900 uppercase tracking-wider">Missing Items & Gaps</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {[
                        { label: "Missing Skills", items: analysisReport.missingSkills },
                        { label: "Missing Technologies", items: analysisReport.missingTechnologies },
                        { label: "Missing Keywords", items: analysisReport.missingKeywords },
                        { label: "Missing Certifications", items: analysisReport.missingCertifications },
                        { label: "Missing Action Verbs", items: analysisReport.missingActionVerbs },
                        { label: "Missing Responsibilities", items: analysisReport.missingResponsibilities },
                      ].map((cat, i) => (
                        <div key={i} className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-600 block">{cat.label}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.items && cat.items.length > 0 ? (
                              cat.items.map((item: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                                  {item}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] text-emerald-600 italic">None missing!</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recommendations, Density & Suggestions */}
                  <Card className="shadow-sm border-indigo-100">
                    <CardHeader className="py-3 bg-indigo-50/50 border-b">
                      <CardTitle className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Suggestions & Why</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        {analysisReport.suggestions && analysisReport.suggestions.map((s: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg border bg-slate-50 text-[11px]">
                            <p className="font-bold text-slate-800">💡 {s.recommendation}</p>
                            <p className="text-slate-500 mt-0.5">{s.why}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 border-t pt-3">
                        <span className="text-[11px] font-bold text-slate-600 block">Keyword Density Analysis</span>
                        <div className="grid grid-cols-2 gap-2">
                          {analysisReport.keywordDensity && analysisReport.keywordDensity.slice(0, 8).map((kd: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] p-1 border rounded bg-slate-50">
                              <span className="font-medium text-slate-700 truncate max-w-[120px]">{kd.keyword}</span>
                              <Badge className="bg-slate-200 text-slate-800 text-[9px] shrink-0">{kd.densityPercent}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 4. Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="shadow-sm border-emerald-100">
                    <CardHeader className="py-3 bg-emerald-50/50 border-b">
                      <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-700">
                        {analysisReport.strengths && analysisReport.strengths.map((str: string, idx: number) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-rose-100">
                    <CardHeader className="py-3 bg-rose-50/50 border-b">
                      <CardTitle className="text-xs font-bold text-rose-900 uppercase tracking-wider">Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-700">
                        {analysisReport.weaknesses && analysisReport.weaknesses.map((wk: string, idx: number) => (
                          <li key={idx}>{wk}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Cover Letter */}
        {activeTab === "cover-letter" && (
          <div className="p-4 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
            {/* Left side parameters */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="py-3 bg-slate-50 border-b">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">Letter Parameters</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Company Name</Label>
                    <Input
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Job Role / Title</Label>
                    <Input
                      placeholder="e.g. Developer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Hiring Manager</Label>
                    <Input
                      placeholder="e.g. John Doe, Recruitment Team"
                      value={hiringManager}
                      onChange={(e) => setHiringManager(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Writing Tone</Label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-background"
                    >
                      <option value="professional">Professional / Direct</option>
                      <option value="formal">Formal / Traditional</option>
                      <option value="friendly">Friendly / Passionate</option>
                      <option value="confident">Confident / Bold</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Length</Label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-background"
                    >
                      <option value="short">Short (1-2 paragraphs)</option>
                      <option value="medium">Medium (3 paragraphs)</option>
                      <option value="long">Long (4 paragraphs)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Paste Job Description</Label>
                    <Textarea
                      placeholder="Paste target job description..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="text-xs min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerateCoverLetter}
                      disabled={generatingLetter || !jobDescription}
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs cursor-pointer font-semibold w-full"
                    >
                      {generatingLetter ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Generating...
                        </>
                      ) : (
                        "Generate Cover Letter"
                      )}
                    </Button>
                    {generatingLetter && (
                      <Button onClick={cancelRequest} variant="destructive" className="text-xs cursor-pointer">
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cover Letters list library */}
              {coverLettersList.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="py-2.5 bg-slate-50 border-b">
                    <CardTitle className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Saved Cover Letters ({coverLettersList.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1.5">
                    {coverLettersList.map((letter) => (
                      <div
                        key={letter.id}
                        onClick={() => setActiveCoverLetter(letter)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          activeCoverLetter?.id === letter.id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-800 font-bold"
                            : "hover:bg-slate-50 border-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="min-w-0 pr-1.5">
                          <p className="truncate">{letter.jobRole || "Cover Letter"}</p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">{letter.companyName || "Unknown Company"}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCoverLetter(letter.id)
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right side editor */}
            <div className="lg:col-span-8">
              {activeCoverLetter ? (
                <Card className="shadow-sm h-full flex flex-col min-h-[500px]">
                  <CardHeader className="py-3 border-b flex flex-row items-center justify-between gap-3 bg-slate-50/50 shrink-0">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800">
                        {activeCoverLetter.jobRole || "Target Position"} Cover Letter
                      </CardTitle>
                      <CardDescription className="text-[10px]">
                        Editable text. Autosave/Manual save updates.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={copyLetterToClipboard}
                        className="h-8 w-8 cursor-pointer hover:bg-slate-100"
                        title="Copy to Clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={downloadLetterDocx}
                        className="h-8 w-8 cursor-pointer hover:bg-slate-100"
                        title="Download Word (DOC)"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={downloadLetterPdf}
                        className="h-8 w-8 cursor-pointer hover:bg-slate-100"
                        title="Print / PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleSaveCoverLetter}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold cursor-pointer h-8 px-3.5 shadow-sm"
                      >
                        Save Letter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <Textarea
                      value={activeCoverLetter.coverLetterText}
                      onChange={(e) =>
                        setActiveCoverLetter({
                          ...activeCoverLetter,
                          coverLetterText: e.target.value,
                        })
                      }
                      className="w-full h-full min-h-[400px] text-xs leading-relaxed font-serif p-4 focus:ring-0 focus-visible:ring-0 border bg-white shadow-inner resize-none"
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-xl min-h-[450px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
                  <FileText className="h-12 w-12 text-slate-350" />
                  <h3 className="text-sm font-bold text-slate-700 mt-3">No Cover Letter Selected</h3>
                  <p className="text-xs text-slate-450 mt-1 max-w-sm">
                    Generate a cover letter using the options panel on the left, or select a previously saved cover letter.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: History & Library */}
        {activeTab === "history" && (
          <div className="p-4 max-w-4xl mx-auto space-y-6 pb-12">
            {/* Search filter */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
              <Input
                placeholder="Search previous job descriptions or company names..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-9 text-xs"
              />
              {historySearch && (
                <Button
                  onClick={() => {
                    setHistorySearch("")
                  }}
                  variant="ghost"
                  className="absolute right-1 top-1 h-7 text-[10px] cursor-pointer"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* List Previous JDs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Job Descriptions</h3>
              {prevJobDescriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prevJobDescriptions.map((jd) => (
                    <Card key={jd.id} className="shadow-sm border-slate-200">
                      <CardHeader className="py-3 border-b flex flex-row items-center justify-between gap-3 bg-slate-50/50">
                        <div className="min-w-0">
                          <CardTitle className="text-xs font-bold text-slate-800 truncate">{jd.jobRole || "Target Role"}</CardTitle>
                          <CardDescription className="text-[10px] truncate">{jd.companyName || "Target Company"}</CardDescription>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setJobDescription(jd.jobDescriptionText)
                              setCompanyName(jd.companyName || "")
                              setJobRole(jd.jobRole || "")
                              setActiveTab("optimize")
                              toast.info("Job description loaded into analyzer!")
                            }}
                            className="text-[10px] h-7 px-2 cursor-pointer border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            Reuse
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteHistoryItem(undefined, jd.id)}
                            className="h-7 w-7 text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3">
                        <p className="text-[10.5px] text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap">{jd.jobDescriptionText}</p>
                        <span className="text-[9px] text-slate-400 mt-2 block">Analyzed on {new Date(jd.createdAt).toLocaleDateString()}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-xl p-6 text-center text-xs text-slate-450 bg-slate-50/50">
                  No analyzed job descriptions found.
                </div>
              )}
            </div>

            {/* List Optimization Snapshots */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Resume Optimization Checkpoints</h3>
              {historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          Optimized for {hist.jobTitle || "Job Title"} at {hist.companyName || "Company"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Created on {new Date(hist.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreCheckpoint(hist.id)}
                          className="text-[10px] h-7 cursor-pointer border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Restore Snapshot
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteHistoryItem(hist.id, undefined)}
                          className="h-7 w-7 text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-xl p-6 text-center text-xs text-slate-450 bg-slate-50/50">
                  No optimization checkpoint snapshots found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Side-by-Side Comparison Dialog Modal */}
      <Dialog open={comparisonOpen} onOpenChange={setComparisonOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-6 border border-indigo-100">
          <DialogHeader className="shrink-0 border-b pb-3">
            <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              AI Optimization Preview & Approval
            </DialogTitle>
            <DialogDescription className="text-xs">
              Compare original resume vs AI suggestions. Fabricated facts are prohibited. Review changes and select to accept or discard.
            </DialogDescription>
          </DialogHeader>

          {/* Explanation block */}
          {optExplanation && (
            <div className="shrink-0 p-3 rounded-lg border bg-indigo-50/30 text-[11px] text-indigo-900 border-indigo-100 mb-2">
              <span className="font-bold">✨ What changed:</span> {optExplanation}
            </div>
          )}

          {/* Compare splits */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {/* Left side current */}
            <div className="flex flex-col border rounded-xl overflow-hidden min-h-0 bg-white">
              <div className="p-2 border-b bg-slate-50 text-[11px] font-bold text-slate-500 shrink-0">
                ORIGINAL RESUME CONTENT
              </div>
              <div className="flex-1 overflow-auto p-4 text-[11.5px] leading-relaxed font-sans whitespace-pre-wrap select-none text-slate-600 bg-slate-50/20">
                {originalResumeJsonBackup ? (
                  optimizationMode === "entire" ? (
                    JSON.stringify(originalResumeJsonBackup, null, 2)
                  ) : (
                    JSON.stringify(originalResumeJsonBackup[activeOptSection], null, 2)
                  )
                ) : (
                  "No data"
                )}
              </div>
            </div>

            {/* Right side optimized */}
            <div className="flex flex-col border border-indigo-200 rounded-xl overflow-hidden min-h-0 bg-white">
              <div className="p-2 border-b bg-indigo-50 text-[11px] font-bold text-indigo-700 shrink-0">
                ✨ SUGGESTED OPTIMIZED CONTENT
              </div>
              <div className="flex-1 overflow-auto p-4 text-[11.5px] leading-relaxed font-sans whitespace-pre-wrap text-indigo-950 bg-indigo-50/5">
                {optimizedResumeJsonBackup ? (
                  optimizationMode === "entire" ? (
                    JSON.stringify(optimizedResumeJsonBackup, null, 2)
                  ) : (
                    JSON.stringify(optimizedResumeJsonBackup[activeOptSection], null, 2)
                  )
                ) : (
                  "No data"
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t pt-3 flex flex-row justify-end gap-2.5">
            <Button
              variant="outline"
              onClick={() => {
                setComparisonOpen(false)
                toast.info("Suggestions discarded.")
              }}
              className="text-xs cursor-pointer"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleAcceptOptimization}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold cursor-pointer"
            >
              <Check className="h-4 w-4 mr-1.5" /> Accept Optimization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
