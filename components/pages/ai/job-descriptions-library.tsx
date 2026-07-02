"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AppLoader } from "@/components/app-loader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Trash2, Star, Briefcase, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"

interface JobDescription {
  id: string;
  title: string;
  company: string;
  descriptionText: string;
  isFavorite: boolean;
  createdAt: string;
}

export default function JobDescriptionsLibrary() {
  const [jds, setJds] = useState<JobDescription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Create modal states
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [descriptionText, setDescriptionText] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchJds = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/ai/job-descriptions")
      if (res.ok) {
        setJds(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJds()
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || !company.trim() || !descriptionText.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setSaving(true)
      const res = await fetch("/api/ai/job-descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          descriptionText: descriptionText.trim(),
        }),
      })

      if (res.ok) {
        toast.success("Job description saved successfully")
        setCreateOpen(false)
        setTitle("")
        setCompany("")
        setDescriptionText("")
        fetchJds()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/ai/job-descriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFavorite: !currentStatus }),
      })
      if (res.ok) {
        setJds(jds.map(item => item.id === id ? { ...item, isFavorite: !currentStatus } : item))
        toast.success(currentStatus ? "Removed from favorites" : "Added to favorites")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/job-descriptions?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setJds(jds.filter(item => item.id !== id))
        toast.success("Job description deleted")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredJds = jds.filter(item => {
    const term = search.toLowerCase()
    return (
      item.title.toLowerCase().includes(term) ||
      item.company.toLowerCase().includes(term) ||
      item.descriptionText.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Description Library"
        description="Save, structure, and reuse target job descriptions for instant resume ATS scoring and tailoring"
      >
        <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9 text-xs gap-1.5 cursor-pointer bg-primary text-white font-bold">
          <Plus className="h-4 w-4" /> Save Job Description
        </Button>
      </PageHeader>

      <Card className="shadow-sm border-slate-100">
        <CardContent className="p-4 relative">
          <Search className="absolute left-6 top-6 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search saved job descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9.5"
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-24">
          <AppLoader message="Loading job description library" />
        </div>
      ) : filteredJds.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50">
          <Briefcase className="h-12 w-12 text-slate-350 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No Job Descriptions Saved</h4>
          <p className="text-xs text-slate-500 mt-1">Add job descriptions to reuse during resume evaluations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJds.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
            return (
              <Card key={item.id} className="shadow-sm border hover:border-slate-300 transition-all border-slate-100 flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-800 leading-normal">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-indigo-650 mt-0.5">
                      {item.company}
                    </CardDescription>
                  </div>

                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleToggleFavorite(item.id, item.isFavorite)}
                      className="p-1 hover:bg-slate-150 rounded-md transition-colors cursor-pointer"
                    >
                      <Star className={`h-4.5 w-4.5 ${item.isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="py-2 text-xs">
                  <p className="text-slate-500 line-clamp-4 leading-relaxed whitespace-pre-wrap font-sans">
                    {item.descriptionText}
                  </p>
                </CardContent>

                <CardFooter className="pt-2 border-t flex justify-between items-center bg-slate-50/50 pb-3 mt-4">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Saved {dateStr}
                  </span>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800">Save Job Description</DialogTitle>
            <DialogDescription className="text-xs">
              Add details of the target job application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Job Title</Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Company Name</Label>
              <Input
                placeholder="e.g. Aadrika Enterprises"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Job Description Text</Label>
              <Textarea
                placeholder="Paste the full job details, requirements, and responsibilities here..."
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                rows={8}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="text-xs bg-primary text-white font-bold">
              {saving ? "Saving..." : "Save Job Description"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
