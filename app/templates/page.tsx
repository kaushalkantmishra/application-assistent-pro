"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Layout, BookOpen, Clock, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface Resume {
  id: string
  title: string
  templateId: string
  updatedAt: string
}

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern Elegant",
    category: "Modern",
    description: "Sleek single-column layout with clean margins and primary accents.",
    recommendedUse: "Startups, tech roles, and marketing specialists.",
    previewText: "Your Name\nemail@example.com | 123-456-7890\n\nExperience\nSoftware Engineer at Startup (2025 - Present)",
  },
  {
    id: "professional",
    name: "Professional Corporate",
    category: "Corporate",
    description: "Traditional double-column layout maximizing text space.",
    recommendedUse: "Senior profiles, finance, and corporate management.",
    previewText: "Your Name\n\nSummary\nExperienced lead manager.",
  },
  {
    id: "developer",
    name: "Developer Terminal",
    category: "Developer",
    description: "Dark-mode monospace terminal layout.",
    recommendedUse: "Backend engineers, CLI developers, and hackers.",
    previewText: "~/resume $ cat info.json",
  },
  {
    id: "minimal",
    name: "Minimalist Book",
    category: "Minimal",
    description: "Serif-dominated book style layout.",
    recommendedUse: "Academic writers, teachers, and researchers.",
    previewText: "Your Name\n\nEducation\nPh.D in Computer Science",
  },
  {
    id: "classic",
    name: "Classic ATS Jake",
    category: "ATS Friendly",
    description: "Clean single-column standard format passing any ATS parser.",
    recommendedUse: "General job applications, MNC candidates.",
    previewText: "Your Name\n\nSkills: React, Node, Python",
  },
]

export default function TemplatesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes")
      if (res.ok) {
        setResumes(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleApplyTemplate = async (resumeId: string) => {
    if (!selectedTemplateId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      })

      if (res.ok) {
        toast.success("Template applied successfully!")
        setApplyOpen(false)
        fetchResumes()
      } else {
        toast.error("Failed to apply template")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <PageHeader
            title="Premium Templates Library"
            description="Explore modern designs engineered to pass applicant tracking systems (ATS) with one-click theme switching"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {TEMPLATES.map((tmpl) => (
              <Card key={tmpl.id} className="shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 bg-slate-50/50 border-b">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800">{tmpl.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-indigo-650 mt-1">
                      {tmpl.category}
                    </CardDescription>
                  </div>
                  <Badge className="bg-indigo-600 text-white text-[9px] uppercase font-bold">Free</Badge>
                </CardHeader>

                <CardContent className="py-4 space-y-3.5">
                  <div className="h-32 w-full rounded border bg-slate-50/50 p-3 select-none overflow-hidden relative font-mono text-[6px] text-slate-400">
                    <div className="absolute inset-0 bg-slate-900/5 pointer-events-none" />
                    <pre className="whitespace-pre-wrap">{tmpl.previewText}</pre>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase block">Description</span>
                    <p className="text-xs text-slate-500 leading-normal">{tmpl.description}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase block">Recommended for</span>
                    <p className="text-xs text-slate-500 leading-normal font-medium">{tmpl.recommendedUse}</p>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t bg-slate-50/50 pb-3 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id)
                      setApplyOpen(true)
                    }}
                    className="h-8 text-xs cursor-pointer bg-primary text-white gap-1.5 font-bold"
                  >
                    <Layout className="h-3.5 w-3.5" /> Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* APPLY DIALOG */}
          <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Apply Template to Resume</DialogTitle>
                <DialogDescription className="text-xs">
                  Choose which resume you would like to apply this template style to. This will not affect your resume content data.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-60 overflow-y-auto space-y-2 py-2 pr-1">
                {resumes.map((res) => {
                  const isCurrent = res.templateId === selectedTemplateId
                  return (
                    <button
                      key={res.id}
                      onClick={() => handleApplyTemplate(res.id)}
                      disabled={loading || isCurrent}
                      className={`w-full flex items-center justify-between p-3 border rounded-lg text-left transition-all ${
                        isCurrent
                          ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
                          : "hover:bg-indigo-50/10 hover:border-indigo-300 border-slate-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">{res.title}</span>
                        <span className="text-[10px] text-slate-400">Current layout: {res.templateId}</span>
                      </div>
                      {isCurrent ? (
                        <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-200 bg-emerald-50 font-bold uppercase gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Selected
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-indigo-650 font-bold">Apply</span>
                      )}
                    </button>
                  )
                })}

                {resumes.length === 0 && (
                  <span className="text-xs text-slate-400 block text-center py-6">Please create a resume first.</span>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setApplyOpen(false)} className="text-xs">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
