"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppLoader } from "@/components/app-loader"
import { 
  Search, 
  ExternalLink, 
  Clock, 
  Bookmark, 
  BookOpen, 
  Video, 
  Award, 
  FileText, 
  Code, 
  Users, 
  CheckCircle,
  PlayCircle,
  HelpCircle,
  Flame,
  BookmarkCheck
} from "lucide-react"
import { toast } from "sonner"

interface ReadingMaterial {
  id: string
  title: string
  category: string
  type: string
  url?: string | null
  description?: string | null
  difficulty?: string | null
  estimatedTime?: string | null
  author?: string | null
  rating?: number | null
}

interface LearningPath {
  id: string
  title: string
  description?: string | null
  category: string
  difficulty: string
  estimatedTime?: string | null
}

interface ProgressItem {
  id: string
  materialId: string
  completed: boolean
  progress: number
}

interface BookmarkItem {
  id: string
  itemId: string
  itemType: string
}

const CATEGORIES = [
  "Frontend", "Backend", "React", "Next.js", "Node.js", "Java", "DSA", "System Design", "Behavioral", "HR", "Aptitude"
]

const categoryIcons: Record<string, any> = {
  Frontend: Code,
  Backend: DatabaseIcon,
  React: Code,
  "Next.js": GlobeIcon,
  "Node.js": DatabaseIcon,
  Java: Code,
  DSA: Code,
  "System Design": Award,
  Behavioral: Users,
  HR: Users,
  Aptitude: FileText,
}

// Fallback helper
function DatabaseIcon(props: any) {
  return <Code {...props} />
}
function GlobeIcon(props: any) {
  return <BookOpen {...props} />
}

const typeIcons: Record<string, any> = {
  Article: FileText,
  Video: Video,
  Course: BookOpen,
  Book: BookOpen,
  Practice: Code,
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-50 text-green-700 border-green-200",
  Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-250",
  Advanced: "bg-red-50 text-red-700 border-red-200",
}

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<ReadingMaterial[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [progressList, setProgressList] = useState<ProgressItem[]>([])
  const [bookmarksList, setBookmarksList] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [materialsRes, progressRes, bookmarksRes, pathsRes] = await Promise.all([
        fetch("/api/reading-materials"),
        fetch("/api/learning-progress"),
        fetch("/api/bookmarks"),
        fetch("/api/learning-paths").then(res => res.ok ? res.json() : [])
      ])

      if (materialsRes.ok) setMaterials(await materialsRes.json())
      if (progressRes.ok) setProgressList(await progressRes.json())
      if (bookmarksRes.ok) setBookmarksList(await bookmarksRes.json())
      if (Array.isArray(pathsRes)) setLearningPaths(pathsRes)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load study resources")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Toggle progress completion
  const handleToggleComplete = async (materialId: string) => {
    const isCompleted = progressList.find(p => p.materialId === materialId)?.completed || false
    try {
      const res = await fetch("/api/learning-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId,
          completed: !isCompleted,
        }),
      })

      if (res.ok) {
        toast.success(isCompleted ? "Marked as in-progress" : "Marked as completed!")
        // Refresh progress list
        const updatedProgress = await fetch("/api/learning-progress").then(r => r.json())
        setProgressList(updatedProgress)
      } else {
        throw new Error("Failed to update progress")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update progress")
    }
  }

  // Toggle Bookmark
  const handleToggleBookmark = async (materialId: string) => {
    const bookmarked = bookmarksList.find(b => b.itemId === materialId && b.itemType === "study_material")
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: materialId,
          itemType: "study_material",
        }),
      })

      if (res.ok) {
        toast.success(bookmarked ? "Bookmark removed" : "Added to bookmarks!")
        // Refresh bookmarks list
        const updatedBookmarks = await fetch("/api/bookmarks").then(r => r.json())
        setBookmarksList(updatedBookmarks)
      } else {
        throw new Error("Failed to update bookmark")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update bookmark")
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory
    const matchesType = selectedType === "all" || material.type === selectedType
    const matchesDifficulty = selectedDifficulty === "all" || material.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty
  })

  // Calculate statistics
  const completedCount = progressList.filter(p => p.completed).length
  const totalCount = materials.length
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <AppLoader message="Loading study materials & learning path progress" />
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <PageHeader
            title="Study & Learning Materials"
            description="Curated paths, DSA roadmaps, and career advancement guides to make you interview-ready"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 py-1 px-3">
                <Flame className="h-3.5 w-3.5 mr-1 text-orange-500 fill-orange-500" /> Learning Progress: {completionPercent}%
              </Badge>
            </div>
          </PageHeader>

          {/* 1. Statistics & Learning Paths */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            <div className="lg:col-span-4 space-y-6">
              <Card className="shadow-sm border-indigo-100 bg-indigo-50/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4 text-indigo-600" /> Active Learning Paths
                  </CardTitle>
                  <CardDescription className="text-xs">Structured modules to build your coding and system architecture skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningPaths.length > 0 ? (
                    learningPaths.map(path => (
                      <div key={path.id} className="p-3 border rounded-lg bg-white shadow-sm flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{path.title}</span>
                          <Badge variant="outline" className="text-[9px] scale-95 font-bold uppercase">{path.category}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{path.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" /> <span>{path.estimatedTime || "N/A"}</span>
                          <span>•</span>
                          <span>{path.difficulty}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-lg">
                      No active paths available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 2. Resources Catalog */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-4">
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search study guides, videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 text-xs h-9.5"
                      />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="text-xs cursor-pointer h-9.5">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-pointer text-xs">All Categories</SelectItem>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat} className="cursor-pointer text-xs">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="text-xs cursor-pointer h-9.5">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-pointer text-xs">All Difficulties</SelectItem>
                        <SelectItem value="Beginner" className="cursor-pointer text-xs">Beginner</SelectItem>
                        <SelectItem value="Intermediate" className="cursor-pointer text-xs">Intermediate</SelectItem>
                        <SelectItem value="Advanced" className="cursor-pointer text-xs">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMaterials.map((mat) => {
                  const isCompleted = progressList.find(p => p.materialId === mat.id)?.completed || false
                  const isBookmarked = bookmarksList.some(b => b.itemId === mat.id && b.itemType === "study_material")
                  const IconComponent = categoryIcons[mat.category] || HelpCircle

                  return (
                    <Card key={mat.id} className={`shadow-sm border transition-all hover:border-slate-300 relative ${isCompleted ? "bg-emerald-50/5 border-emerald-100" : ""}`}>
                      {/* Header */}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="text-[9px] scale-95 font-bold uppercase gap-1 bg-indigo-50 text-indigo-750">
                            <IconComponent className="h-2.5 w-2.5" /> {mat.category}
                          </Badge>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleBookmark(mat.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                              title={isBookmarked ? "Remove Bookmark" : "Bookmark Material"}
                            >
                              <Bookmark className={`h-4 w-4 ${isBookmarked ? "text-indigo-600 fill-indigo-650" : "text-slate-400"}`} />
                            </button>

                            <button
                              onClick={() => handleToggleComplete(mat.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                              title={isCompleted ? "Mark In-Progress" : "Mark Completed"}
                            >
                              <CheckCircle className={`h-4 w-4 ${isCompleted ? "text-emerald-600 fill-emerald-100" : "text-slate-300"}`} />
                            </button>
                          </div>
                        </div>

                        <CardTitle className="text-xs font-bold text-slate-800 line-clamp-2 mt-2 leading-relaxed">
                          {mat.title}
                        </CardTitle>
                        <CardDescription className="text-[10px] line-clamp-2 mt-1">
                          {mat.description}
                        </CardDescription>
                      </CardHeader>

                      {/* Footer */}
                      <CardContent className="pt-2 border-t flex items-center justify-between mt-4 pb-3">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          {mat.difficulty && (
                            <Badge variant="outline" className={`text-[9px] uppercase border px-1.5 ${difficultyColors[mat.difficulty] || ""}`}>
                              {mat.difficulty}
                            </Badge>
                          )}
                          {mat.estimatedTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {mat.estimatedTime}
                            </span>
                          )}
                        </div>

                        {mat.url && (
                          <Button size="sm" variant="ghost" asChild className="h-7 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer pl-2">
                            <a href={mat.url} target="_blank" rel="noopener noreferrer" className="gap-1 flex items-center">
                              Start Guide <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}

                {filteredMaterials.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed rounded-lg bg-slate-50/50">
                    <BookOpen className="h-10 w-10 text-slate-300 mx-auto animate-pulse mb-3" />
                    <h4 className="text-sm font-bold text-slate-700">No Resources Found</h4>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
