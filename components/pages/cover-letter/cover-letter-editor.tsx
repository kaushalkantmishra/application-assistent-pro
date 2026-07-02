"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLoader } from "@/components/app-loader"
import {
  ArrowLeft,
  Clock,
  Printer,
  Download,
  Star,
  Settings,
  History,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Version {
  id: string
  versionName: string
  coverLetterText: string
  createdAt: string
}

const TEMPLATES = [
  { id: "formal", name: "Formal Executive", style: "font-serif text-slate-900 bg-white" },
  { id: "modern", name: "Modern Minimalist", style: "font-sans text-slate-800 bg-white border-t-4 border-indigo-600" },
  { id: "creative", name: "Creative Startup", style: "font-sans text-emerald-950 bg-emerald-50/10 border-l-4 border-emerald-600" },
]

export default function CoverLetterEditorPage({ id }: { id: string }) {
  const router = useRouter()
  const [letter, setLetter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTemplate, setActiveTemplate] = useState("modern")

  // Version states
  const [versions, setVersions] = useState<Version[]>([])
  const [showVersions, setShowVersions] = useState(false)
  const [verName, setVerName] = useState("")

  // Save states
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Structural fields
  const [greeting, setGreeting] = useState("Dear Hiring Manager,")
  const [intro, setIntro] = useState("")
  const [body, setBody] = useState("")
  const [closing, setClosing] = useState("Sincerely,")
  const [signature, setSignature] = useState("")

  // Load cover letter details
  const fetchLetter = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/cover-letters/${id}`)
      if (res.ok) {
        const data = await res.json()
        setLetter(data)

        // Parse text into structures or set default values
        const text = data.coverLetterText || ""
        const lines = text.split("\n\n").filter(Boolean)
        
        if (lines.length >= 5) {
          setGreeting(lines[0])
          setIntro(lines[1])
          setBody(lines.slice(2, -2).join("\n\n"))
          setClosing(lines[lines.length - 2])
          setSignature(lines[lines.length - 1])
        } else {
          setIntro(text)
        }
      } else {
        toast.error("Cover letter not found")
        router.push("/cover-letters")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Load versions
  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/cover-letters/${id}/versions`)
      if (res.ok) setVersions(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchLetter()
    fetchVersions()
  }, [id])

  // Assemble full text block
  const getFullText = () => {
    return `${greeting}\n\n${intro}\n\n${body}\n\n${closing}\n\n${signature}`
  }

  // Debounced Autosave
  useEffect(() => {
    if (!letter || loading) return

    const timer = setTimeout(async () => {
      setSavingStatus("saving")
      try {
        const fullText = getFullText()
        const res = await fetch(`/api/cover-letters/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coverLetterText: fullText,
          }),
        })

        if (res.ok) {
          setSavingStatus("saved")
          setLastSaved(new Date())
          fetchVersions() // Reload version logs
        } else {
          setSavingStatus("error")
        }
      } catch (err) {
        console.error(err)
        setSavingStatus("error")
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [greeting, intro, body, closing, signature])

  // Restore snapshot version
  const handleRestoreVersion = async (versionId: string) => {
    try {
      setSavingStatus("saving")
      const res = await fetch(`/api/cover-letters/${id}/versions?action=restore&versionId=${versionId}`, {
        method: "POST",
      })

      if (res.ok) {
        toast.success("Snapshot version restored!")
        fetchLetter()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Manual Version Save
  const handleCreateManualVersion = async () => {
    if (!verName.trim()) return
    try {
      const res = await fetch(`/api/cover-letters/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionName: verName.trim(),
          coverLetterText: getFullText(),
        }),
      })

      if (res.ok) {
        toast.success("Version checkpoint saved")
        setVerName("")
        fetchVersions()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // print cover letter
  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AppLoader message="Retrieving your cover letter document workspace" />
      </div>
    )
  }

  const selectedStyle = TEMPLATES.find((t) => t.id === activeTemplate)?.style || ""

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900/5 text-slate-800">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1.5in !important;
            box-shadow: none !important;
            border: none !important;
          }
          header, aside, [data-panel-resize-handle], button, input, textarea {
            display: none !important;
          }
        }
      ` }} />

      {/* TOP HEADER */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between shrink-0 shadow-sm z-10 no-print">
        <div className="flex items-center gap-3">
          <Link href="/cover-letters">
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="font-bold text-sm text-slate-800">
            {letter.jobRole} at {letter.companyName}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            {savingStatus === "saving" && (
              <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50 border-blue-200 animate-pulse">
                Saving...
              </Badge>
            )}
            {savingStatus === "saved" && (
              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-55 border-emerald-250 font-bold">
                <Check className="h-2.5 w-2.5 mr-0.5" /> Saved
              </Badge>
            )}
            {savingStatus === "error" && (
              <Badge variant="destructive" className="text-[10px]">
                Error
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowVersions(!showVersions)} className="h-8 w-8 cursor-pointer" title="Version History">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrint} className="h-8 w-8 cursor-pointer" title="Print Letter">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* EDITOR PANELS */}
      <div className="flex-1 overflow-hidden relative">
        <PanelGroup direction="horizontal">
          {/* LEFT: Text Editor blocks */}
          <Panel defaultSize={45} minSize={30} className="bg-card flex flex-col h-full overflow-hidden border-r">
            <div className="p-3.5 border-b bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Edit Sections</span>
              <Select value={activeTemplate} onValueChange={setActiveTemplate}>
                <SelectTrigger className="w-[140px] text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Salutation / Greeting</Label>
                <Input
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Dear Hiring Manager,"
                  className="text-xs h-8.5 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Introduction Paragraph</Label>
                <Textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="State the position you are applying for and why you are excited..."
                  rows={4}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Body Paragraphs (Projects & Experience)</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Describe your relevant skills, projects, and achievements..."
                  rows={8}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Closing Statement</Label>
                <Input
                  value={closing}
                  onChange={(e) => setClosing(e.target.value)}
                  placeholder="Sincerely,"
                  className="text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Signature / Sender Name</Label>
                <Input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Kaushal Kant Mishra"
                  className="text-xs h-8.5 font-semibold"
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-slate-100 hover:bg-slate-200 transition-colors cursor-col-resize shrink-0" />

          {/* MIDDLE: Letter Preview */}
          <Panel defaultSize={55} className="flex flex-col h-full bg-slate-900/5 overflow-auto p-8 items-center justify-start">
            <div
              id="print-area"
              className={`w-full max-w-[8.5in] min-h-[11in] shadow-md rounded p-12 border ${selectedStyle} leading-relaxed`}
              style={{
                fontFamily: activeTemplate === "formal" ? "Georgia, serif" : "Inter, Arial, sans-serif",
                fontSize: "13px",
              }}
            >
              {/* Header block info */}
              <div className="mb-10 text-xs text-slate-400 font-sans border-b pb-4">
                <div className="font-bold text-slate-800 text-sm">Cover Letter Document</div>
                <div className="mt-1">For: {letter.companyName} — {letter.jobRole}</div>
                <div>Created: {new Date(letter.createdAt).toLocaleDateString()}</div>
              </div>

              {/* Greeting */}
              <div className="font-semibold mb-4">{greeting}</div>

              {/* Intro */}
              <div className="mb-4 whitespace-pre-wrap">{intro}</div>

              {/* Body */}
              <div className="mb-6 whitespace-pre-wrap">{body}</div>

              {/* Closing */}
              <div className="mb-4">{closing}</div>

              {/* Signature */}
              <div className="font-bold">{signature}</div>
            </div>
          </Panel>

          {/* RIGHT: Versions sidebar (toggleable) */}
          {showVersions && (
            <>
              <PanelResizeHandle className="w-1.5 bg-slate-100 cursor-col-resize" />
              <Panel defaultSize={22} minSize={15} className="bg-card border-l flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Versions History</span>
                </div>
                
                <div className="p-3 border-b space-y-2 shrink-0">
                  <Label className="text-[10px] font-bold text-slate-655 uppercase">Save Checkpoint</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. V2 Tailored"
                      value={verName}
                      onChange={(e) => setVerName(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Button size="sm" onClick={handleCreateManualVersion} className="h-8 text-xs cursor-pointer">
                      Save
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {versions.map((ver) => (
                    <div key={ver.id} className="p-2 border rounded-lg bg-slate-50 text-xs flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-700 truncate pr-1">{ver.versionName}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestoreVersion(ver.id)}
                          className="h-6 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 pl-1 pr-1"
                        >
                          Restore
                        </Button>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">
                        {new Date(ver.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}

                  {versions.length === 0 && (
                    <span className="text-xs text-slate-400 block text-center py-6">No snapshots saved yet.</span>
                  )}
                </div>
              </Panel>
            </>
          )}

        </PanelGroup>
      </div>
    </div>
  )
}
