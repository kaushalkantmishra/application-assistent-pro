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
  createdAt: string
  updatedAt: string
}

const TEMPLATE_OPTIONS = [
  { id: "modern", name: "Modern Template", description: "Elegant, clean single-column layout with bold titles.", bg: "from-blue-50 to-indigo-50" },
  { id: "professional", name: "Professional Template", description: "Traditional double-column layout for senior candidates.", bg: "from-slate-50 to-slate-100" },
  { id: "developer", name: "Developer Template", description: "Monospace typographic accent style optimized for tech.", bg: "from-slate-800 to-slate-900 text-white" },
  { id: "minimal", name: "Minimal Template", description: "Understated classic serif typographic layout.", bg: "from-zinc-50 to-zinc-100" },
  { id: "classic", name: "Classic Developer", description: "ATS-friendly classic single-column serif layout with bold headings and right-aligned dates, identical to the Jake's Resume standard.", bg: "from-amber-50/50 to-orange-50/50" },
]

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
          <AppLoader variant="skeleton" />
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
                  >
                    <div className="text-slate-400 opacity-60 flex flex-col items-center">
                      <FileText className="h-12 w-12 text-primary/60 group-hover:scale-105 transition-transform duration-300 mb-1" />
                      <span className="text-xs uppercase font-semibold tracking-wider text-slate-500">{resume.templateId} template</span>
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
                      <DropdownMenuContent align="end" className="w-[140px]">
                        <DropdownMenuItem onClick={() => openRenameDialog(resume.id, resume.title)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(resume.id)} className="cursor-pointer">
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
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
                    <h4 className="font-bold text-slate-800 truncate cursor-pointer hover:underline" onClick={() => router.push(`/resumes/${resume.id}/edit`)}>
                      {resume.title}
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openRenameDialog(resume.id, resume.title)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(resume.id)} className="cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
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
