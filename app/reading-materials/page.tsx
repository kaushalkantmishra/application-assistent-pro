"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockReadingMaterials } from "@/lib/mock-data"
import { Search, ExternalLink, Clock, Star, BookOpen, Video, Award, FileText, Code, Users } from "lucide-react"

const categoryIcons = {
  DSA: Code,
  "System Design": Award,
  "HR Questions": Users,
  Aptitude: FileText,
  "Resume Tips": FileText,
  Behavioral: Users,
  Technical: Code,
}

const typeIcons = {
  Article: FileText,
  Video: Video,
  Course: BookOpen,
  Book: BookOpen,
  Practice: Code,
}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
}

export default function ReadingMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const categories = Array.from(new Set(mockReadingMaterials.map((material) => material.category)))
  const types = Array.from(new Set(mockReadingMaterials.map((material) => material.type)))
  const difficulties = Array.from(new Set(mockReadingMaterials.map((material) => material.difficulty)))

  const filteredMaterials = mockReadingMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory
    const matchesType = selectedType === "all" || material.type === selectedType
    const matchesDifficulty = selectedDifficulty === "all" || material.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty
  })

  const materialsByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = filteredMaterials.filter((material) => material.category === category)
      return acc
    },
    {} as Record<string, typeof mockReadingMaterials>,
  )

  return (
    <AppLayout>
      <PageHeader
        title="Reading Materials"
        description="Curated resources to help you prepare for interviews and advance your career"
      >
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
            {filteredMaterials.length} Resources
          </Badge>
        </div>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Find Resources</CardTitle>
          <CardDescription>Filter by category, type, or difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materialsByCategory[category]?.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredMaterials.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  )
}

function MaterialCard({ material }: { material: (typeof mockReadingMaterials)[0] }) {
  const CategoryIcon = categoryIcons[material.category]
  const TypeIcon = typeIcons[material.type]

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs">
              {material.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{material.type}</span>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">{material.title}</CardTitle>
        {material.author && <p className="text-sm text-muted-foreground">by {material.author}</p>}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="flex-1 mb-4">{material.description}</CardDescription>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{material.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{material.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge className={difficultyColors[material.difficulty]}>{material.difficulty}</Badge>
            <Button size="sm" asChild>
              <a href={material.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Access
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
