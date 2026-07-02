"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLoader } from "@/components/app-loader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Star,
  FileText,
  Clock,
  MoreVertical,
  Plus,
  Grid,
  List as ListIcon,
  Trash2,
  Edit,
  Copy,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Resume {
  id: string
  title: string
  templateId: string
  themeId: string
  isFavorite: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
  resumeJson: Record<string, any>
}

const TEMPLATE_OPTIONS = [
  { id: "modern", name: "Modern Template", description: "Elegant, clean single-column layout with bold titles.", bg: "from-blue-50 to-indigo-50" },
  { id: "professional", name: "Professional Template", description: "Traditional double-column layout for senior candidates.", bg: "from-slate-50 to-slate-100" },
  { id: "developer", name: "Developer Template", description: "Monospace typographic accent style optimized for tech.", bg: "from-slate-800 to-slate-900 text-white" },
  { id: "minimal", name: "Minimal Template", description: "Understated classic serif typographic layout.", bg: "from-zinc-50 to-zinc-100" },
  { id: "classic", name: "Classic Developer", description: "ATS-friendly classic single-column serif layout with bold headings and right-aligned dates, identical to the Jake's Resume standard.", bg: "from-amber-50/50 to-orange-50/50" },
]

const renderTemplatePreview = (templateId: string, resumeJson: Record<string, any>) => {
  const personalInfo = resumeJson?.personalInfo || {}
  const fullName = personalInfo.fullName || "Your Name"
  const email = personalInfo.email || "email@example.com"
  const phone = personalInfo.phone || "123-456-7890"
  
  const summaryText = resumeJson?.summary?.text || ""
  const isSummaryVisible = resumeJson?.summary?.visible !== false && summaryText
  
  const experienceList = resumeJson?.experience?.items || []
  const educationList = resumeJson?.education?.items || []
  const skillsList = resumeJson?.technicalSkills?.items || []
  
  const firstExp = experienceList[0] || {}
  
  switch (templateId) {
    case "classic":
      return (
        <div className="w-full h-full bg-white p-3 flex flex-col gap-1 select-none text-[5px] leading-[1.2] text-slate-800 font-sans shadow-inner">
          {/* Header */}
          <div className="text-center space-y-0.5">
            <div className="font-bold text-[8px] tracking-tight uppercase text-slate-950">{fullName}</div>
            <div className="flex justify-center gap-1.5 text-[4px] text-slate-500">
              {email && <span>{email}</span>}
              {phone && <span>• {phone}</span>}
            </div>
          </div>
          <hr className="border-t border-slate-300 my-0.5" />
          
          {/* Summary */}
          {isSummaryVisible && (
            <div className="space-y-0.5">
              <div className="font-bold text-[5px] uppercase text-slate-900 tracking-wide border-b border-slate-100 pb-0.5">Professional Summary</div>
              <p className="text-[4px] text-slate-650 line-clamp-2 leading-relaxed">{summaryText}</p>
            </div>
          )}
          
          {/* Experience */}
          {experienceList.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-bold text-[5px] uppercase text-slate-900 tracking-wide border-b border-slate-100 pb-0.5">Professional Experience</div>
              {experienceList.slice(0, 1).map((exp: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-[4.5px] text-slate-850">
                    <span>{exp.role || "Job Role"} at {exp.company || "Company"}</span>
                    <span className="text-[3.5px] text-slate-400 font-normal">{exp.duration || "Date"}</span>
                  </div>
                  <p className="text-[4px] text-slate-650 line-clamp-2 leading-snug">{exp.description || "Developed software solutions"}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {educationList.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-bold text-[5px] uppercase text-slate-900 tracking-wide border-b border-slate-100 pb-0.5">Education</div>
              {educationList.slice(0, 1).map((edu: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-[4.5px]">
                  <span className="font-bold text-slate-800">{edu.degree || "Degree"} — {edu.institution || "School"}</span>
                  <span className="text-[3.5px] text-slate-400">{edu.year || "Year"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    case "professional":
      return (
        <div className="w-full h-full bg-white flex select-none text-[5px] leading-[1.2] text-slate-800 font-sans shadow-inner">
          {/* Left Column (Sidebar) */}
          <div className="w-[32%] bg-slate-50 p-2.5 flex flex-col gap-2 border-r border-slate-100 h-full">
            <div className="w-8 h-8 rounded-full bg-indigo-100/80 mx-auto flex items-center justify-center font-bold text-[8px] text-indigo-700">
              {fullName.charAt(0) || "U"}
            </div>
            
            <div className="space-y-0.5 text-center">
              <div className="font-bold text-[4.5px] text-slate-800 truncate">{fullName}</div>
              <div className="text-[3.5px] text-slate-500 truncate">{email}</div>
            </div>

            {skillsList.length > 0 && (
              <div className="space-y-1">
                <div className="font-bold text-[4.5px] text-slate-900 border-b pb-0.5 uppercase tracking-wider">Skills</div>
                <div className="flex flex-wrap gap-0.5">
                  {skillsList.slice(0, 4).map((skill: any, i: number) => (
                    <span key={i} className="bg-slate-200 text-slate-700 px-1 py-0.5 rounded-[2px] text-[3.5px]">
                      {skill.skills?.split(",")[0] || skill.category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column (Content) */}
          <div className="w-[68%] p-2.5 flex flex-col gap-2.5">
            {isSummaryVisible && (
              <div className="space-y-0.5">
                <div className="font-bold text-[5px] text-indigo-600 uppercase tracking-wide border-b pb-0.5">Profile Summary</div>
                <p className="text-[4px] text-slate-650 line-clamp-2 leading-relaxed">{summaryText}</p>
              </div>
            )}
            
            {experienceList.length > 0 && (
              <div className="space-y-1">
                <div className="font-bold text-[5px] text-indigo-600 uppercase tracking-wide border-b pb-0.5">Experience</div>
                {experienceList.slice(0, 1).map((exp: any, i: number) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-[4.5px] text-slate-855">
                      <span>{exp.role}</span>
                      <span className="text-[3.5px] text-slate-400 font-normal">{exp.duration}</span>
                    </div>
                    <div className="text-[4px] text-slate-500 font-semibold">{exp.company}</div>
                    <p className="text-[4px] text-slate-650 line-clamp-2 leading-snug">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )

    case "developer":
      return (
        <div className="w-full h-full bg-slate-950 p-3 flex flex-col gap-1 select-none text-[4.5px] leading-[1.2] text-emerald-400 font-mono shadow-inner">
          <div className="flex justify-between items-center text-slate-600 border-b border-slate-900 pb-0.5 mb-0.5 text-[3.5px]">
            <span>bash</span><span>● ✖ 💻</span>
          </div>
          <div>
            <span className="text-blue-400">~/resume $</span> cat info.json
          </div>
          <div className="text-slate-300 pl-2 whitespace-pre-wrap">
            {`{\n  "name": "${fullName}",\n  "target": "${firstExp.role || "Developer"}"\n}`}
          </div>
          <div className="mt-1">
            <span className="text-blue-400">~/resume $</span> cat skills.list
          </div>
          <div className="text-slate-400 pl-2 line-clamp-2">
            {skillsList.map((s: any) => s.skills).join(", ") || "React, Node.js, Express, MongoDB"}
          </div>
        </div>
      )

    case "minimal":
      return (
        <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 select-none text-[5px] leading-[1.3] text-zinc-800 font-serif shadow-inner">
          <div className="text-center my-0.5">
            <div className="font-bold text-[8.5px] italic text-zinc-955">{fullName}</div>
            <div className="text-[4px] text-zinc-500 italic">{firstExp.role || "Professional Candidate"}</div>
          </div>
          
          {isSummaryVisible && (
            <div className="space-y-0.5 text-center">
              <p className="text-[4px] leading-relaxed text-zinc-655 line-clamp-2 italic px-2">"{summaryText}"</p>
            </div>
          )}
          
          <hr className="border-t border-zinc-200" />
          
          {experienceList.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-semibold text-[4.5px] uppercase tracking-wider text-zinc-500 text-center">Experience</div>
              {experienceList.slice(0, 1).map((exp: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-[4.5px] text-zinc-900">
                    <span>{exp.role} at {exp.company}</span>
                    <span className="text-[3.5px] text-zinc-400 font-normal">{exp.duration}</span>
                  </div>
                  <p className="text-[4px] text-zinc-655 line-clamp-2 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    case "modern":
    default:
      return (
        <div className="w-full h-full bg-white p-3 flex flex-col gap-1.5 select-none text-[5px] leading-[1.2] text-slate-800 font-sans shadow-inner">
          {/* Header */}
          <div className="space-y-0.5">
            <div className="font-bold text-[8.5px] text-indigo-600 tracking-tight">{fullName}</div>
            <div className="text-[4px] text-slate-450 font-semibold">{firstExp.role || "Software Engineer"}</div>
            <div className="h-0.5 bg-indigo-500 rounded w-full mt-0.5" />
          </div>
          
          {/* Summary */}
          {isSummaryVisible && (
            <div className="space-y-0.5">
              <div className="font-bold text-[4.5px] text-indigo-500 uppercase tracking-wide">Summary</div>
              <p className="text-[4px] text-slate-650 line-clamp-2 leading-relaxed">{summaryText}</p>
            </div>
          )}
          
          {/* Experience */}
          {experienceList.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-bold text-[4.5px] text-indigo-500 uppercase tracking-wide">Experience</div>
              {experienceList.slice(0, 1).map((exp: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-[4.5px] text-slate-850">
                    <span>{exp.role} at {exp.company}</span>
                    <span className="text-[3.5px] text-slate-400 font-normal">{exp.duration}</span>
                  </div>
                  <p className="text-[4px] text-slate-655 line-clamp-2 leading-snug">{exp.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
  }
}

export default function ResumeDashboardPage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Search & Filter state
  const [search, setSearch] = useState("")
  const [filterTemplate, setFilterTemplate] = useState("all")
  const [filterFavorite, setFilterFavorite] = useState("all")
  const [sortBy, setSortBy] = useState("updatedAt")
  const [sortOrder, setSortOrder] = useState("desc")

  // Create wizard state
  const [createOpen, setCreateOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(2)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [newResumeTitle, setNewResumeTitle] = useState("")
  const [creating, setCreating] = useState(false)

  // Actions states
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameResumeId, setRenameResumeId] = useState("")
  const [renameTitle, setRenameTitle] = useState("")
  const [renaming, setRenaming] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteResumeId, setDeleteResumeId] = useState("")
  const [deleting, setDeleting] = useState(false)

  const loadResumes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filterTemplate !== "all") params.append("templateId", filterTemplate)
      if (filterFavorite === "favorite") params.append("isFavorite", "true")
      params.append("sortBy", sortBy)
      params.append("sortOrder", sortOrder)

      const res = await fetch(`/api/resumes?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResumes(data)
      } else {
        toast.error("Failed to load resumes")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load resumes")
    } finally {
      setLoading(false)
    }
  }

  // Refetch when search/filter/sort parameters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadResumes()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [search, filterTemplate, filterFavorite, sortBy, sortOrder])

  // Handle favorite toggle
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/resumes/${id}/favorite`, { method: "PUT" })
      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
        )
        toast.success("Favorite toggled")
      } else {
        toast.error("Failed to update favorite status")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error toggling favorite")
    }
  }

  // Handle default toggle
  const handleToggleDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const resume = resumes.find((r) => r.id === id)
      if (!resume) return

      const isMakingDefault = !resume.isDefault
      if (isMakingDefault) {
        const defaultCount = resumes.filter((r) => r.isDefault).length
        if (defaultCount >= 5) {
          toast.error("You can set a maximum of 5 resumes as default.")
          return
        }
      }

      const res = await fetch(`/api/resumes/${id}/default`, { method: "PUT" })
      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isDefault: !r.isDefault } : r))
        )
        toast.success(isMakingDefault ? "Set as default resume" : "Removed default status")
      } else {
        const errText = await res.text()
        try {
          const parsed = JSON.parse(errText)
          toast.error(parsed.error || "Failed to update default status")
        } catch {
          toast.error("Failed to update default status")
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Error toggling default status")
    }
  }

  // Create new resume wizard execution
  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) {
      toast.error("Resume name is required")
      return
    }
    try {
      setCreating(true)
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newResumeTitle.trim(),
          templateId: selectedTemplate,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Resume created successfully!")
        setCreateOpen(false)
        router.push(`/resumes/${data.id}/edit`)
      } else {
        toast.error("Failed to create resume")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error creating resume")
    } finally {
      setCreating(false)
    }
  }

  // Duplicate resume
  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setResumes((prev) => [data, ...prev])
        toast.success("Resume duplicated successfully")
      } else {
        toast.error("Failed to duplicate resume")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error duplicating resume")
    }
  }

  // Rename resume
  const handleRename = async () => {
    if (!renameTitle.trim()) {
      toast.error("Title cannot be empty")
      return
    }
    try {
      setRenaming(true)
      const res = await fetch(`/api/resumes/${renameResumeId}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameTitle.trim() }),
      })

      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) => (r.id === renameResumeId ? { ...r, title: renameTitle.trim() } : r))
        )
        toast.success("Resume renamed")
        setRenameOpen(false)
      } else {
        toast.error("Failed to rename")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error renaming")
    } finally {
      setRenaming(false)
    }
  }

  // Delete resume (soft delete)
  const handleDelete = async () => {
    try {
      setDeleting(true)
      const res = await fetch(`/api/resumes/${deleteResumeId}`, { method: "DELETE" })
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== deleteResumeId))
        toast.success("Resume deleted")
        setDeleteOpen(false)
      } else {
        toast.error("Failed to delete")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error deleting")
    } finally {
      setDeleting(false)
    }
  }

  const openRenameDialog = (id: string, currentTitle: string) => {
    setRenameResumeId(id)
    setRenameTitle(currentTitle)
    setRenameOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeleteResumeId(id)
    setDeleteOpen(true)
  }

  const startCreateWizard = () => {
    setWizardStep(2)
    setNewResumeTitle("")
    setCreateOpen(true)
  }

  return (
    <>
      <PageHeader title="Resume Management" description="Create and organize highly customizable, schema-driven resumes">
        <Button onClick={startCreateWizard} className="cursor-pointer gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
          <Plus className="h-4 w-4" /> Create Resume
        </Button>
      </PageHeader>

      <div className="space-y-6">
        {/* Filters and Layout controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resumes..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters select */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">

            <Select value={filterFavorite} onValueChange={setFilterFavorite}>
              <SelectTrigger className="w-[130px] cursor-pointer">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resumes</SelectItem>
                <SelectItem value="favorite">Favorites</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] cursor-pointer">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>

            {/* View switcher */}
            <div className="flex border rounded-lg overflow-hidden shrink-0">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none cursor-pointer h-9 w-9"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none cursor-pointer h-9 w-9"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {loading ? (
          <AppLoader message="Retrieving your saved resumes" />
        ) : resumes.length === 0 ? (
          <Card className="text-center py-12 bg-muted/20 border-dashed">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No Resumes Found</CardTitle>
              <CardDescription>
                Create your first dynamic resume using our schema-driven editor.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button onClick={startCreateWizard} className="cursor-pointer">
                Create First Resume
              </Button>
            </CardFooter>
          </Card>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="group hover:shadow-md transition-all duration-300 relative overflow-hidden bg-card border flex flex-col justify-between">
                <div>
                  {/* Card Header Thumbnail Placeholder */}
                  <div
                    onClick={() => router.push(`/resumes/${resume.id}/edit`)}
                    className="h-40 w-full bg-gradient-to-br from-blue-500/5 to-indigo-500/10 flex items-center justify-center border-b cursor-pointer group-hover:bg-primary/5 transition-colors relative"
                  >                    {/* Default resume indicator */}
                    {resume.isDefault && (
                      <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 z-10 animate-pulse">
                        <Sparkles className="h-2.5 w-2.5" /> Default
                      </span>
                    )}

                    {/* Template placeholder preview visual */}
                    <div className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300">
                      {renderTemplatePreview(resume.templateId, resume.resumeJson)}
                    </div>

                    {/* Favorite toggle overlay */}
                    <button
                      onClick={(e) => handleToggleFavorite(resume.id, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background border cursor-pointer transition-colors shadow-sm"
                    >
                      <Star className={`h-4 w-4 ${resume.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`} />
                    </button>
                  </div>

                  <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-base font-bold text-slate-800 line-clamp-1">{resume.title}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardFooter className="pt-2 border-t flex justify-between items-center bg-slate-50/50">
                  <Badge variant="outline" className="text-xs capitalize">{resume.templateId}</Badge>
                  
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => router.push(`/resumes/${resume.id}/edit`)}>
                      Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => openRenameDialog(resume.id, resume.title)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(resume.id)} className="cursor-pointer">
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleToggleDefault(resume.id, e)} className="cursor-pointer text-indigo-700 font-semibold focus:text-indigo-850">
                          <Sparkles className={`h-4 w-4 mr-2 ${resume.isDefault ? "fill-indigo-600 text-indigo-600" : "text-indigo-550"}`} />
                          {resume.isDefault ? "Remove Default" : "Mark as Default"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDeleteDialog(resume.id)} className="text-destructive cursor-pointer">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="border rounded-xl divide-y bg-card overflow-hidden shadow-sm">
            {resumes.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <button onClick={(e) => handleToggleFavorite(resume.id, e)} className="cursor-pointer">
                    <Star className={`h-5 w-5 ${resume.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                  </button>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate cursor-pointer hover:underline flex items-center gap-2" onClick={() => router.push(`/resumes/${resume.id}/edit`)}>
                      {resume.title}
                      {resume.isDefault && (
                        <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[9px] h-4 font-bold uppercase py-0 px-1 shadow-sm flex items-center gap-0.5 animate-pulse text-white">
                          <Sparkles className="h-2.5 w-2.5" /> Default
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                      <span className="capitalize">Template: {resume.templateId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => router.push(`/resumes/${resume.id}/edit`)}>
                    Open
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => openRenameDialog(resume.id, resume.title)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(resume.id)} className="cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleToggleDefault(resume.id, e)} className="cursor-pointer text-indigo-700 font-semibold focus:text-indigo-850">
                        <Sparkles className={`h-4 w-4 mr-2 ${resume.isDefault ? "fill-indigo-600 text-indigo-600" : "text-indigo-550"}`} />
                        {resume.isDefault ? "Remove Default" : "Mark as Default"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openDeleteDialog(resume.id)} className="text-destructive cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE RESUME DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
              Name your new resume (it will use the default Classic Developer layout)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Resume Name / Job Title Target</label>
              <Input
                placeholder="e.g. Frontend Engineer - Stripe application"
                value={newResumeTitle}
                onChange={(e) => setNewResumeTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateResume()}
                className="h-11 text-sm"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Give your resume a descriptive name that targets a specific job or company.</p>
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button variant="ghost" onClick={() => setCreateOpen(false)} className="cursor-pointer">Cancel</Button>
              <Button onClick={handleCreateResume} disabled={creating} className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white min-w-[120px]">
                {creating ? "Creating..." : "Create & Edit"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* RENAME RESUME DIALOG */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>Provide a new title for this resume</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameOpen(false)} className="cursor-pointer">Cancel</Button>
              <Button onClick={handleRename} disabled={renaming} className="cursor-pointer">
                {renaming ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action will soft-delete the resume and remove it from your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="cursor-pointer">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
