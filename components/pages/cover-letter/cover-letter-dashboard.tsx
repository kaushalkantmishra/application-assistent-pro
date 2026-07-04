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
  Trash2,
  Edit,
  Copy,
  FolderOpen,
  Tag,
  Share2,
  Sparkles,
  ChevronRight,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

interface Folder {
  id: string
  name: string
}

interface TagType {
  id: string
  name: string
}

interface CoverLetter {
  id: string
  companyName: string
  jobRole: string
  hiringManager: string
  coverLetterText: string
  tone: string
  length: string
  createdAt: string
  updatedAt: string
  folder?: Folder | null
  tags: TagType[]
}

export default function CoverLetterDashboardPage() {
  const router = useRouter()
  const [letters, setLetters] = useState<CoverLetter[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)

  // Filtering states
  const [search, setSearch] = useState("")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Modal creation states
  const [createOpen, setCreateOpen] = useState(false)
  const [newCompany, setNewCompany] = useState("")
  const [newRole, setNewRole] = useState("")
  const [newTone, setNewTone] = useState("professional")
  const [creating, setCreating] = useState(false)

  // Folder & Tag Modal states
  const [folderOpen, setFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [tagOpen, setTagOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  // Delete states
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLetterId, setDeleteLetterId] = useState("")
  const [deleting, setDeleting] = useState(false)

  const loadFoldersAndTags = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        fetch("/api/folders?type=cover-letter"),
        fetch("/api/tags?type=cover-letter"),
      ])
      if (foldersRes.ok) setFolders(await foldersRes.json())
      if (tagsRes.ok) setTags(await tagsRes.json())
    } catch (e) {
      console.error(e)
    }
  }

  const loadCoverLetters = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/cover-letters")
      if (res.ok) {
        setLetters(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFoldersAndTags()
    loadCoverLetters()
  }, [])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), type: "cover-letter" }),
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

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), type: "cover-letter" }),
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

  const handleMoveToFolder = async (letterId: string, folderId: string | null) => {
    try {
      if (folderId) {
        await fetch(`/api/cover-letters/${letterId}/folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId }),
        })
      } else {
        await fetch(`/api/cover-letters/${letterId}/folders`, {
          method: "DELETE",
        })
      }
      toast.success("Folder placement updated")
      loadCoverLetters()
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleTagMapping = async (letterId: string, tagId: string, isMapped: boolean) => {
    try {
      if (!isMapped) {
        await fetch(`/api/cover-letters/${letterId}/tags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagId }),
        })
      } else {
        await fetch(`/api/cover-letters/${letterId}/tags?tagId=${tagId}`, {
          method: "DELETE",
        })
      }
      loadCoverLetters()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateLetter = async () => {
    if (!newCompany.trim() || !newRole.trim()) {
      toast.error("Company name and job role are required")
      return
    }

    try {
      setCreating(true)
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: newCompany.trim(),
          jobRole: newRole.trim(),
          tone: newTone,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Cover letter generated")
        setCreateOpen(false)
        router.push(`/cover-letters/${data.id}/edit`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const handleDuplicate = async (letter: CoverLetter) => {
    try {
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: `${letter.companyName} (Copy)`,
          jobRole: letter.jobRole,
          coverLetterText: letter.coverLetterText,
        }),
      })
      if (res.ok) {
        toast.success("Cover letter duplicated")
        loadCoverLetters()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const res = await fetch(`/api/cover-letters/${deleteLetterId}`, { method: "DELETE" })
      if (res.ok) {
        setLetters(letters.filter((l) => l.id !== deleteLetterId))
        setDeleteOpen(false)
        toast.success("Cover letter deleted")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const filteredLetters = letters.filter((l) => {
    const company = l.companyName || ""
    const role = l.jobRole || ""
    const matchesSearch =
      company.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = !selectedFolderId || l.folder?.id === selectedFolderId
    const matchesTags =
      selectedTagIds.length === 0 ||
      selectedTagIds.every((tagId) => l.tags.some((t) => t.id === tagId))

    return matchesSearch && matchesFolder && matchesTags
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cover Letter Hub"
        description="Design professional cover letters, manage templates, and version-control letters for various companies"
      >
        <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9 text-xs gap-1.5 cursor-pointer bg-primary text-white">
          <Plus className="h-4 w-4" /> Create Cover Letter
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Left Side: Folders & Tags Sidebar */}
        <div className="lg:col-span-3 space-y-6">
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
                <span>All Documents</span>
                <Badge variant="secondary" className="text-[10px] scale-90">{letters.length}</Badge>
              </button>

              {folders.map((folder) => {
                const count = letters.filter((l) => l.folder?.id === folder.id).length
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
                {tags.length === 0 && <span className="text-xs text-slate-400">No tags.</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Letters List */}
        <div className="lg:col-span-9 space-y-4">
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-4 relative">
              <Search className="absolute left-6 top-6 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search cover letters by role or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9.5"
              />
            </CardContent>
          </Card>

          {loading ? (
            <div className="py-20">
              <AppLoader message="Retrieving cover letters list" />
            </div>
          ) : filteredLetters.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Cover Letters Found</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLetters.map((letter) => {
                const dateStr = new Date(letter.updatedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                return (
                  <Card key={letter.id} className="shadow-sm border hover:border-slate-300 transition-all border-slate-100 flex flex-col justify-between overflow-hidden">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800 leading-normal">
                          {letter.jobRole}
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-indigo-650 mt-0.5">
                          {letter.companyName}
                        </CardDescription>
                      </div>

                      <div className="flex gap-0.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-slate-450" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs w-[160px]">
                            <DropdownMenuItem className="cursor-pointer text-xs" asChild>
                              <Link href={`/cover-letters/${letter.id}/edit`}>
                                <Edit className="h-3.5 w-3.5 mr-2" /> Edit Letter
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-xs" onClick={() => handleDuplicate(letter)}>
                              <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {/* Folder Submenu */}
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Move to Folder</div>
                            <DropdownMenuItem className="cursor-pointer text-xs pl-4" onClick={() => handleMoveToFolder(letter.id, null)}>
                              None
                            </DropdownMenuItem>
                            {folders.map((f) => (
                              <DropdownMenuItem key={f.id} className="cursor-pointer text-xs pl-4" onClick={() => handleMoveToFolder(letter.id, f.id)}>
                                📁 {f.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />

                            {/* Tags Toggle */}
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toggle Tags</div>
                            {tags.map((t) => {
                              const isMapped = letter.tags.some((tag) => tag.id === t.id)
                              return (
                                <DropdownMenuCheckboxItem
                                  key={t.id}
                                  checked={isMapped}
                                  className="text-xs"
                                  onCheckedChange={() => handleToggleTagMapping(letter.id, t.id, isMapped)}
                                >
                                  {t.name}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="cursor-pointer text-xs text-destructive"
                              onClick={() => {
                                setDeleteLetterId(letter.id)
                                setDeleteOpen(true)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="py-2 text-xs">
                      <p className="text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                        {letter.coverLetterText}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {letter.folder && (
                          <Badge variant="outline" className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border-indigo-100 uppercase">
                            📁 {letter.folder.name}
                          </Badge>
                        )}
                        {letter.tags.map((t) => (
                          <Badge key={t.id} variant="secondary" className="text-[9px] font-bold uppercase">
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 border-t flex justify-between items-center bg-slate-50/50 pb-3 mt-4">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Updated {dateStr}
                      </span>
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs font-bold text-primary cursor-pointer hover:bg-slate-100">
                        <Link href={`/cover-letters/${letter.id}/edit`}>
                          Open <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-md font-bold">
              <Sparkles className="h-5 w-5 text-indigo-650" />
              Generate Cover Letter
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Company Name</Label>
              <Input
                placeholder="e.g. Aadrika Enterprises"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Job Role</Label>
              <Input
                placeholder="e.g. Backend Engineer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Tone of Voice</Label>
              <Select value={newTone} onValueChange={setNewTone}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="professional" className="text-xs">Professional & Formal</SelectItem>
                  <SelectItem value="casual" className="text-xs">Casual & Conversational</SelectItem>
                  <SelectItem value="confident" className="text-xs">Confident & Assertive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleCreateLetter} disabled={creating} className="text-xs bg-primary text-white">
              {creating ? "Generating..." : "Generate Letter"}
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

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Cover Letter</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this cover letter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="text-xs">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
