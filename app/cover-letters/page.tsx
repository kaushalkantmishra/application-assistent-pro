"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AppLoader } from "@/components/app-loader"
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Download, 
  FileText,
  Mail,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface Resume {
  id: string
  title: string
  templateId: string
  themeId: string
  isDefault: boolean
  isFavorite: boolean
  updatedAt: string
  resumeJson: Record<string, any>
}

export default function CoverLettersRoute() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [jobDescription, setJobDescription] = useState("")
  const [tone, setTone] = useState<string>("professional")
  const [length, setLength] = useState<string>("medium")
  
  // Generation & editing state
  const [generating, setGenerating] = useState(false)
  const [coverLetterText, setCoverLetterText] = useState("")
  const [coverLetterTitle, setCoverLetterTitle] = useState("")
  const [copied, setCopied] = useState(false)

  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoadingResumes(true)
        const res = await fetch("/api/resumes")
        if (res.ok) {
          const data = await res.json()
          setResumes(data)
          // Pre-select default or first resume
          const defaultRes = data.find((r: Resume) => r.isDefault) || data[0]
          if (defaultRes) {
            setSelectedResumeId(defaultRes.id)
          }
        } else {
          toast.error("Failed to load resumes")
        }
      } catch (err) {
        console.error("Load resumes error:", err)
        toast.error("Failed to load resumes")
      } finally {
        setLoadingResumes(false)
      }
    }
    fetchResumes()
  }, [])

  // Action: Generate cover letter
  const handleGenerate = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a target resume")
      return
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the target job description")
      return
    }

    try {
      setGenerating(true)
      setCoverLetterText("")

      const res = await fetch(`/api/resumes/${selectedResumeId}/ai/cover-letters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescriptionText: jobDescription.trim(),
          tone,
          length,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to generate cover letter")
      }

      const data = await res.json()
      setCoverLetterText(data.coverLetterText)
      
      const selectedResume = resumes.find(r => r.id === selectedResumeId)
      const fullName = selectedResume?.resumeJson?.personalInfo?.fullName || ""
      const targetTitle = fullName 
        ? `${fullName} Cover Letter`
        : selectedResume 
          ? `${selectedResume.title} Cover Letter`
          : "AI Tailored Cover Letter"
      setCoverLetterTitle(targetTitle)
      toast.success("Cover letter generated successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to generate cover letter")
    } finally {
      setGenerating(false)
    }
  }

  // Export: Copy to Clipboard
  const handleCopy = async () => {
    if (!coverLetterText) return
    try {
      await navigator.clipboard.writeText(coverLetterText)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy text")
    }
  }

  // Export: Download DOCX (HTML wrapper blob)
  const downloadDocx = () => {
    if (!coverLetterText) return
    const content = coverLetterText.replace(/\n/g, "<br/>")
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Cover Letter</title><style>body { font-family: Arial, sans-serif; line-height: 1.5; padding: 40px; }</style></head>
      <body>${content}</body>
      </html>
    `
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${coverLetterTitle || 'cover-letter'}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("DOCX download started")
  }

  // Export: Download PDF (print wrapper)
  const downloadPdf = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const formattedContent = coverLetterText.replace(/\n/g, "<br/>")
    printWindow.document.write(`
      <html>
        <head>
          <title>${coverLetterTitle || "Cover Letter"}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              padding: 40px;
              line-height: 1.6;
              color: #1a1a1a;
              max-width: 800px;
              margin: 0 auto;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 24px;
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 10px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="title">${coverLetterTitle || "Cover Letter"}</div>
          <div>${formattedContent}</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <AuthGuard>
      <AppLayout>
        <PageHeader 
          title="AI Cover Letter Generator" 
          description="Instantly generate tailored cover letters based on your professional details and any target job description"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Form options */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" /> Generation Parameters
                </CardTitle>
                <CardDescription>Select target resume profile and copy job description details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Resume Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Select Profile / Resume</Label>
                  {loadingResumes ? (
                    <div className="h-10 bg-slate-100 rounded animate-pulse" />
                  ) : resumes.length === 0 ? (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200">
                      No resumes found. Please create a resume first in the My Resumes page.
                    </div>
                  ) : (
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select target resume profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((res) => (
                          <SelectItem key={res.id} value={res.id} className="cursor-pointer">
                            {res.title} {res.isDefault && "(Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Job Description Textarea */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Pasted Job Description / Requirements</Label>
                  <Textarea
                    placeholder="Paste the target job description or role requirements here..."
                    className="min-h-[160px] text-xs leading-relaxed"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                {/* Tone and Length controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Writing Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="cursor-pointer text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional" className="text-xs cursor-pointer">💼 Professional</SelectItem>
                        <SelectItem value="casual" className="text-xs cursor-pointer">👋 Casual</SelectItem>
                        <SelectItem value="creative" className="text-xs cursor-pointer">🎨 Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Response Length</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger className="cursor-pointer text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short" className="text-xs cursor-pointer">📏 Short (Concise)</SelectItem>
                        <SelectItem value="medium" className="text-xs cursor-pointer">📐 Medium (Standard)</SelectItem>
                        <SelectItem value="long" className="text-xs cursor-pointer">📖 Long (Detailed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || resumes.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer shadow gap-2 text-xs font-semibold"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate Cover Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Output & Editing Workspace */}
          <div className="lg:col-span-7 flex flex-col h-full">
            {generating ? (
              <Card className="flex-1 min-h-[400px] flex items-center justify-center">
                <AppLoader message="Crafting your customized cover letter" />
              </Card>
            ) : coverLetterText ? (
              <Card className="flex-1 flex flex-col shadow-sm border-indigo-100">
                <CardHeader className="pb-3 border-b bg-indigo-50/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">Document Title</Label>
                    <Input
                      value={coverLetterTitle}
                      onChange={(e) => setCoverLetterTitle(e.target.value)}
                      placeholder="Cover Letter Title"
                      className="font-bold text-slate-800 border-none bg-transparent hover:bg-slate-50 focus:bg-white text-base h-8 pl-0 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-xs h-8 gap-1.5"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-xs h-8 gap-1.5"
                      onClick={downloadDocx}
                    >
                      <Download className="h-3.5 w-3.5" /> DOCX
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer text-xs h-8 gap-1.5"
                      onClick={downloadPdf}
                    >
                      <FileText className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <Textarea
                    className="w-full h-[480px] p-6 text-sm leading-relaxed border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white resize-none font-serif"
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    placeholder="Cover letter content..."
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1 border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-indigo-500 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No Cover Letter Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1.5">
                  Select a resume profile, paste a job description on the left, and click generate to build a tailored cover letter here.
                </p>
              </Card>
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
