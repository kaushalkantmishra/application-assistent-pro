"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLoader } from "@/components/app-loader"
import { Label } from "@/components/ui/label"
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
  DropdownMenuCheckboxItem,
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
  FolderOpen,
  Tag,
  Upload,
  Calendar,
  Share2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

interface Folder {
  id: string
  name: string
  createdAt: string
}

interface TagType {
  id: string
  name: string
  createdAt: string
}

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
  folder?: Folder | null
  tags: TagType[]
}

const TEMPLATE_OPTIONS = [
  { id: "modern", name: "Modern Template", description: "Elegant, clean single-column layout with bold titles.", bg: "from-blue-50 to-indigo-50" },
  { id: "professional", name: "Professional Template", description: "Traditional double-column layout for senior candidates.", bg: "from-slate-50 to-slate-100" },
  { id: "developer", name: "Developer Template", description: "Monospace typographic accent style optimized for tech.", bg: "from-slate-800 to-slate-900 text-white" },
  { id: "minimal", name: "Minimal Template", description: "Understated classic serif typographic layout.", bg: "from-zinc-50 to-zinc-100" },
  { id: "classic", name: "Classic Developer", description: "ATS-friendly classic single-column serif layout with bold headings.", bg: "from-amber-50/50 to-orange-50/50" },
]

export default function ResumeDashboardPage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Search & Filters state
  const [search, setSearch] = useState("")
  const [filterTemplate, setFilterTemplate] = useState("all")
  const [filterFavorite, setFilterFavorite] = useState("all")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("updatedAt")
  const [sortOrder, setSortOrder] = useState("desc")

  // Create wizard states
  const [createOpen, setCreateOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(2)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [newResumeTitle, setNewResumeTitle] = useState("")
  const [creating, setCreating] = useState(false)

  // Folder & Tag Modal states
  const [folderOpen, setFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [tagOpen, setTagOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  // Rename states
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameResumeId, setRenameResumeId] = useState("")
  const [renameTitle, setRenameTitle] = useState("")
  const [renaming, setRenaming] = useState(false)

  // Delete states
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteResumeId, setDeleteResumeId] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Import file states
  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFileText, setImportFileText] = useState("")
  const [importFileName, setImportFileName] = useState("")

  const loadFoldersAndTags = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        fetch("/api/folders?type=resume"),
        fetch("/api/tags?type=resume"),
      ])
      if (foldersRes.ok) setFolders(await foldersRes.json())
      if (tagsRes.ok) setTags(await tagsRes.json())
    } catch (e) {
      console.error("Failed to load folder/tag lists:", e)
    }
  }

  const loadResumes = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/resumes")
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

  useEffect(() => {
    loadFoldersAndTags()
    loadResumes()
  }, [])

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), type: "resume" }),
      })
      if (res.ok) {
        const data = await res.json()
        setFolders([...folders, data])
        setNewFolderName("")
        setFolderOpen(false)
        toast.success("Folder created successfully")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Create tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), type: "resume" }),
      })
      if (res.ok) {
        const data = await res.json()
        setTags([...tags, data])
        setNewTagName("")
        setTagOpen(false)
        toast.success("Tag created successfully")
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Map Resume to Folder
  const handleMoveToFolder = async (resumeId: string, folderId: string | null) => {
    try {
      if (folderId) {
        await fetch(`/api/resumes/${resumeId}/folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId }),
        })
      } else {
        await fetch(`/api/resumes/${resumeId}/folders`, {
          method: "DELETE",
        })
      }
      toast.success("Folder placement updated")
      loadResumes()
    } catch (e) {
      console.error(e)
    }
  }

  // Toggle Tag mapping
  const handleToggleTagMapping = async (resumeId: string, tagId: string, isMapped: boolean) => {
    try {
      if (!isMapped) {
        await fetch(`/api/resumes/${resumeId}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId }),
        })
      } else {
        await fetch(`/api/resumes/${resumeId}/tags?tagId=${tagId}`, {
          method: "DELETE",
        })
      }
      loadResumes()
    } catch (e) {
      console.error(e)
    }
  }

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
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Wizard creation
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
      }
    } catch (error) {
      console.error(error)
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
        setResumes([data, ...resumes])
        toast.success("Resume duplicated successfully")
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Rename resume
  const handleRename = async () => {
    if (!renameTitle.trim()) return
    try {
      setRenaming(true)
      const res = await fetch(`/api/resumes/${renameResumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameTitle.trim() }),
      })
      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) => (r.id === renameResumeId ? { ...r, title: renameTitle.trim() } : r))
        )
        setRenameOpen(false)
        toast.success("Resume renamed successfully")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setRenaming(false)
    }
  }

  // Delete resume
  const handleDelete = async () => {
    try {
      setDeleting(true)
      const res = await fetch(`/api/resumes/${deleteResumeId}`, { method: "DELETE" })
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== deleteResumeId))
        setDeleteOpen(false)
        toast.success("Resume deleted")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  // Parse file import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFileName(file.name)
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result as string
      setImportFileText(text)
    }
    reader.readAsText(file)
  }

  const triggerImportSubmit = async () => {
    if (!importFileText) {
      toast.error("Please upload a file first")
      return
    }

    try {
      setImporting(true)
      const res = await fetch("/api/resumes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileText: importFileText, fileName: importFileName }),
      })

      if (res.ok) {
        const parsedJson = await res.json()
        // Save as new resume
        const createRes = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: importFileName.replace(/\.[^/.]+$/, "") + " (Imported)",
            templateId: "classic",
          }),
        })

        if (createRes.ok) {
          const newResData = await createRes.json()
          // Update its JSON
          await fetch(`/api/resumes/${newResData.id}/autosave`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeJson: parsedJson }),
          })

          toast.success("Resume imported successfully!")
          setImportOpen(false)
          router.push(`/resumes/${newResData.id}/edit`)
        }
      } else {
        toast.error("Failed to parse resume content")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to import resume")
    } finally {
      setImporting(false)
    }
  }

  // Filter & Sort resumes locally for super-fast client feedback
  const filteredResumes = resumes
    .filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        res.templateId.toLowerCase().includes(search.toLowerCase())
      const matchesTemplate = filterTemplate === "all" || res.templateId === filterTemplate
      const matchesFav = filterFavorite === "all" || (filterFavorite === "favorite" && res.isFavorite)
      const matchesFolder = !selectedFolderId || res.folder?.id === selectedFolderId
      const matchesTags =
        selectedTagIds.length === 0 ||
        selectedTagIds.every((tagId) => res.tags.some((t) => t.id === tagId))

      return matchesSearch && matchesTemplate && matchesFav && matchesFolder && matchesTags
    })
    .sort((a: any, b: any) => {
      let valA = a[sortBy]
      let valB = b[sortBy]
      if (sortBy === "updatedAt" || sortBy === "createdAt") {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      } else {
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume & Versions Ecosystem"
        description="Create, version-control, and tag multiple professional resumes tailored for specific job designations"
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="h-9 text-xs gap-1.5 cursor-pointer">
            <Upload className="h-4 w-4" /> Import Resume
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9 text-xs gap-1.5 cursor-pointer bg-primary text-white">
            <Plus className="h-4 w-4" /> Create Resume
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Left Side: Folder & Tags Management */}
        <div className="lg:col-span-3 space-y-6">
          {/* Folders Section */}
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderOpen className="h-4 w-4 text-indigo-500" /> Folders
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setFolderOpen(true)}>
                <Plus className="h-3.5 w-3.5 text-slate-650" />
              </Button>
            </CardHeader>
            <CardContent className="pt-3 px-2 space-y-1">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                  !selectedFolderId ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>All Resumes</span>
                <Badge variant="secondary" className="text-[10px] scale-90">{resumes.length}</Badge>
              </button>

              {folders.map((folder) => {
                const count = resumes.filter((r) => r.folder?.id === folder.id).length
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedFolderId === folder.id ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="truncate pr-2">📁 {folder.name}</span>
                    <Badge variant="secondary" className="text-[10px] scale-90">{count}</Badge>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-indigo-500" /> Tags
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setTagOpen(true)}>
                <Plus className="h-3.5 w-3.5 text-slate-650" />
              </Button>
            </CardHeader>
            <CardContent className="pt-3 px-3">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id))
                        } else {
                          setSelectedTagIds([...selectedTagIds, tag.id])
                        }
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                        isSelected
                          ? "bg-indigo-650 border-indigo-650 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  )
                })}

                {tags.length === 0 && (
                  <span className="text-xs text-slate-400">No tags created yet.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Resumes Catalog Grid */}
        <div className="lg:col-span-9 space-y-4">
          {/* Filtering Header Panel */}
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search resumes by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs h-9.5"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterTemplate} onValueChange={setFilterTemplate}>
                  <SelectTrigger className="w-[140px] text-xs h-9.5">
                    <SelectValue placeholder="Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Templates</SelectItem>
                    {TEMPLATE_OPTIONS.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterFavorite} onValueChange={setFilterFavorite}>
                  <SelectTrigger className="w-[120px] text-xs h-9.5">
                    <SelectValue placeholder="Favorites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Items</SelectItem>
                    <SelectItem value="favorite" className="text-xs">Favorites Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px] text-xs h-9.5">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt" className="text-xs">Last Updated</SelectItem>
                    <SelectItem value="createdAt" className="text-xs">Created Date</SelectItem>
                    <SelectItem value="title" className="text-xs">Title Alphabetical</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden h-9.5">
                  <Button
                    size="icon"
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className="h-full w-8.5 rounded-none cursor-pointer"
                  >
                    <Grid className="h-4 w-4 text-slate-650" />
                  </Button>
                  <Button
                    size="icon"
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="h-full w-8.5 rounded-none cursor-pointer"
                  >
                    <ListIcon className="h-4 w-4 text-slate-650" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumes Grid/List Content */}
          {loading ? (
            <div className="py-24">
              <AppLoader message="Retrieving user resumes and tag metadata" />
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Resumes Found</h4>
              <p className="text-xs text-slate-500 mt-1">Create a new resume or adjust your tag filters in the sidebar.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredResumes.map((res) => {
                const dateStr = new Date(res.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                return (
                  <Card key={res.id} className="shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
                    <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
                      <div className="min-w-0 pr-1">
                        <CardTitle className="text-xs font-bold text-slate-800 truncate leading-relaxed">
                          {res.title}
                        </CardTitle>
                        <CardDescription className="text-[10px] scale-95 mt-0.5 origin-left">
                          Template: <span className="font-semibold text-slate-650 uppercase">{res.templateId}</span>
                        </CardDescription>
                      </div>

                      <div className="flex gap-0.5">
                        <button
                          onClick={(e) => handleToggleFavorite(res.id, e)}
                          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Star className={`h-4.5 w-4.5 ${res.isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-slate-450" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs w-[160px]">
                            <DropdownMenuItem className="cursor-pointer text-xs" asChild>
                              <Link href={`/resumes/${res.id}/edit`}>
                                <Edit className="h-3.5 w-3.5 mr-2" /> Open Editor
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => handleDuplicate(res.id)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                setRenameResumeId(res.id)
                                setRenameTitle(res.title)
                                setRenameOpen(true)
                              }}
                            >
                              <Edit className="h-3.5 w-3.5 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {/* Folder Submenu */}
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Move to Folder</div>
                            <DropdownMenuItem className="cursor-pointer text-xs pl-4" onClick={() => handleMoveToFolder(res.id, null)}>
                              None (Root)
                            </DropdownMenuItem>
                            {folders.map((f) => (
                              <DropdownMenuItem key={f.id} className="cursor-pointer text-xs pl-4" onClick={() => handleMoveToFolder(res.id, f.id)}>
                                📁 {f.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />

                            {/* Tags Toggle Submenu */}
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toggle Tags</div>
                            {tags.map((t) => {
                              const isMapped = res.tags.some((tag) => tag.id === t.id)
                              return (
                                <DropdownMenuCheckboxItem
                                  key={t.id}
                                  checked={isMapped}
                                  className="text-xs"
                                  onCheckedChange={() => handleToggleTagMapping(res.id, t.id, isMapped)}
                                >
                                  {t.name}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer text-xs text-destructive hover:text-destructive"
                              onClick={() => {
                                setDeleteResumeId(res.id)
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    {/* Previews and tags display */}
                    <CardContent className="py-2.5">
                      <div className="h-36 w-full rounded border bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                        <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-all pointer-events-none z-10" />
                        <div className="scale-[0.55] origin-center w-full h-full flex items-center justify-center">
                          <FileText className="h-12 w-12 text-slate-350" />
                        </div>
                      </div>
                      
                      {/* Meta Information */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {res.folder && (
                          <Badge variant="outline" className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border-indigo-100 uppercase">
                            📁 {res.folder.name}
                          </Badge>
                        )}
                        {(res.tags || []).slice(0, 2).map((t) => (
                          <Badge key={t.id} variant="secondary" className="text-[9px] font-bold uppercase">
                            {t.name}
                          </Badge>
                        ))}
                        {res.tags && res.tags.length > 2 && (
                          <Badge variant="secondary" className="text-[9px]">
                            +{res.tags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 border-t flex justify-between items-center bg-slate-50/50 pb-3">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Updated {dateStr}
                      </span>
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs font-bold text-primary cursor-pointer hover:bg-slate-100">
                        <Link href={`/resumes/${res.id}/edit`}>
                          Open <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* LIST VIEW MODE */
            <Card className="shadow-sm border-slate-100">
              <CardContent className="p-0">
                <div className="divide-y text-xs">
                  {filteredResumes.map((res) => {
                    const dateStr = new Date(res.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                    return (
                      <div key={res.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            onClick={(e) => handleToggleFavorite(res.id, e)}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Star className={`h-4 w-4 ${res.isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                          </button>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 block truncate">{res.title}</span>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="uppercase text-slate-500 font-semibold">{res.templateId} template</span>
                              <span>•</span>
                              <span>Updated {dateStr}</span>
                            </div>
                          </div>
                        </div>

                        {/* Folders/Tags in List Row */}
                        <div className="hidden md:flex items-center gap-1.5 px-4 min-w-[200px]">
                          {res.folder && (
                            <Badge variant="outline" className="text-[9px] font-bold text-indigo-750 bg-indigo-50 border-indigo-100 uppercase">
                              📁 {res.folder.name}
                            </Badge>
                          )}
                          {res.tags.slice(0, 3).map((t) => (
                            <Badge key={t.id} variant="secondary" className="text-[9px] font-bold uppercase">
                              {t.name}
                            </Badge>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild className="h-8 text-xs cursor-pointer">
                            <Link href={`/resumes/${res.id}/edit`}>Edit</Link>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                                <MoreVertical className="h-4 w-4 text-slate-450" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs w-[160px]">
                              <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => handleDuplicate(res.id)}>
                                <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-xs"
                                onClick={() => {
                                  setRenameResumeId(res.id)
                                  setRenameTitle(res.title)
                                  setRenameOpen(true)
                                }}
                              >
                                <Edit className="h-3.5 w-3.5 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-xs text-destructive"
                                onClick={() => {
                                  setDeleteResumeId(res.id)
                                  setDeleteOpen(true)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CREATE NEW RESUME WIZARD DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-md font-bold text-slate-800">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
              Create Resume Wizard
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure name and layouts to generate a blank workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Resume Name</Label>
              <Input
                placeholder="e.g. Kaushal Kant - Backend Engineer"
                value={newResumeTitle}
                onChange={(e) => setNewResumeTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select Template Format</Label>
              <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {TEMPLATE_OPTIONS.map((opt) => {
                  const isSelected = selectedTemplate === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedTemplate(opt.id)}
                      className={`p-3 border rounded-lg text-left transition-all flex flex-col justify-between h-[100px] cursor-pointer ${
                        isSelected ? "ring-2 ring-primary border-primary bg-indigo-50/10" : "hover:border-slate-300 border-slate-100"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800">{opt.name}</span>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">{opt.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="text-xs cursor-pointer">Cancel</Button>
            <Button onClick={handleCreateResume} disabled={creating} className="text-xs cursor-pointer bg-primary text-white">
              {creating ? "Creating..." : "Create Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE FOLDER DIALOG */}
      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold">Folder Name</Label>
            <Input
              placeholder="e.g. Software Engineer"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleCreateFolder} className="text-xs">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE TAG DIALOG */}
      <Dialog open={tagOpen} onOpenChange={setTagOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold">Tag Name</Label>
            <Input
              placeholder="e.g. React"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleCreateTag} className="text-xs">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RENAME DIALOG */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold">New Title</Label>
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleRename} disabled={renaming} className="text-xs">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this resume? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="text-xs">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPORT DIALOG */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-md font-bold">
              <Upload className="h-5 w-5 text-indigo-650" />
              Import Resume File
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload JSON, TXT, PDF or DOCX file to extract personal info, skills and education detail automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-xs text-slate-600 font-medium">Click to select files</span>
              <span className="text-[10px] text-slate-400 mt-1">JSON, TXT, PDF, DOCX (Max 5MB)</span>
              <input
                type="file"
                accept=".txt,.json,.pdf,.docx"
                onChange={handleImportFile}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {importFileName && (
              <div className="p-3 border rounded-lg bg-indigo-50/30 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate pr-2">📄 {importFileName}</span>
                <Badge className="bg-indigo-600 text-white font-bold">Ready</Badge>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={triggerImportSubmit} disabled={importing || !importFileText} className="text-xs bg-indigo-605 text-white">
              {importing ? "Importing..." : "Parse & Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
