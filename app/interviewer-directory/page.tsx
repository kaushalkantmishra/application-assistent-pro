"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { RoleGuard } from "@/components/role-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockInterviewerProfiles, mockInterviewSessions } from "@/lib/mock-data"
import { Search, Star, Calendar, Users, Github, Linkedin, MapPin, Briefcase, Clock, Award } from "lucide-react"

const interviewTypeColors = {
  Technical: "bg-blue-100 text-blue-800",
  Behavioral: "bg-green-100 text-green-800",
  "System Design": "bg-purple-100 text-purple-800",
  HR: "bg-orange-100 text-orange-800",
}

export default function InterviewerDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all")
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")

  const companies = Array.from(new Set(mockInterviewerProfiles.map((profile) => profile.company)))
  const specializations = Array.from(new Set(mockInterviewerProfiles.flatMap((profile) => profile.specializations)))
  const interviewTypes = Array.from(new Set(mockInterviewerProfiles.flatMap((profile) => profile.interviewTypes)))

  const filteredProfiles = mockInterviewerProfiles
    .filter((profile) => {
      const matchesSearch =
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCompany = selectedCompany === "all" || profile.company === selectedCompany
      const matchesSpecialization =
        selectedSpecialization === "all" || profile.specializations.includes(selectedSpecialization)
      const matchesInterviewType =
        selectedInterviewType === "all" || profile.interviewTypes.includes(selectedInterviewType as any)

      return matchesSearch && matchesCompany && matchesSpecialization && matchesInterviewType && profile.isActive
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "experience":
          return b.experience - a.experience
        case "interviews":
          return b.totalInterviews - a.totalInterviews
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const topInterviewers = mockInterviewerProfiles
    .filter((profile) => profile.isActive)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)

  const recentSessions = mockInterviewSessions
    .filter((session) => session.status === "Completed")
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 5)

  const stats = {
    totalInterviewers: mockInterviewerProfiles.filter((p) => p.isActive).length,
    totalInterviews: mockInterviewerProfiles.reduce((sum, p) => sum + p.totalInterviews, 0),
    averageRating: (
      mockInterviewerProfiles.reduce((sum, p) => sum + p.rating, 0) / mockInterviewerProfiles.length
    ).toFixed(1),
    companiesCount: companies.length,
  }

  return (
    <RoleGuard
      allowedRoles={["job_seeker"]}
      fallbackMessage="The interviewer directory is available for job seekers to find and connect with interviewers."
    >
      <AppLayout>
        <PageHeader
          title="Interviewer Directory"
          description="Comprehensive directory of experienced interviewers from top companies"
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredProfiles.length} Interviewers
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {companies.length} Companies
            </Badge>
          </div>
        </PageHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Interviewers</p>
                  <p className="text-2xl font-bold">{stats.totalInterviewers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                  <p className="text-2xl font-bold">{stats.totalInterviews}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Companies</p>
                  <p className="text-2xl font-bold">{stats.companiesCount}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Find Interviewers</CardTitle>
                <CardDescription>Filter and sort interviewers by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search interviewers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedInterviewType} onValueChange={setSelectedInterviewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Interview Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {interviewTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="interviews">Total Interviews</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Interviewer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <InterviewerCard key={profile.id} profile={profile} />
              ))}
            </div>

            {filteredProfiles.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No interviewers found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top-rated" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top Rated Interviewers
                </CardTitle>
                <CardDescription>Our highest-rated interviewers based on candidate feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topInterviewers.map((profile, index) => (
                    <div key={profile.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                        <AvatarFallback>
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile.role} at {profile.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{profile.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{profile.totalInterviews} interviews</p>
                      </div>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent Interview Activity
                </CardTitle>
                <CardDescription>Latest completed interviews and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => {
                    const interviewer = mockInterviewerProfiles.find((p) => p.id === session.interviewerId)
                    if (!interviewer) return null

                    return (
                      <div key={session.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={interviewer.avatar || "/placeholder.svg"} alt={interviewer.name} />
                          <AvatarFallback>
                            {interviewer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{interviewer.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.type} Interview • {new Date(session.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {session.rating && (
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{session.rating}/5</span>
                            </div>
                          )}
                          <Badge className={interviewTypeColors[session.type as keyof typeof interviewTypeColors]}>
                            {session.type}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AppLayout>
    </RoleGuard>
  )
}

function InterviewerCard({ profile }: { profile: (typeof mockInterviewerProfiles)[0] }) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="text-lg">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-1">{profile.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{profile.role}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{profile.company}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <CardDescription className="flex-1">{profile.bio}</CardDescription>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{profile.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">{profile.totalInterviews}</div>
            <p className="text-xs text-muted-foreground">Interviews</p>
          </div>
        </div>

        {/* Interview Types */}
        <div>
          <p className="text-sm font-medium mb-2">Interview Types</p>
          <div className="flex flex-wrap gap-1">
            {profile.interviewTypes.map((type) => (
              <Badge key={type} className={`text-xs ${interviewTypeColors[type]}`}>
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div>
          <p className="text-sm font-medium mb-2">Specializations</p>
          <div className="flex flex-wrap gap-1">
            {profile.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {profile.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.specializations.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Experience</span>
          <span className="font-medium">{profile.experience} years</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {profile.linkedIn && (
              <Button size="sm" variant="ghost" asChild>
                <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.github && (
              <Button size="sm" variant="ghost" asChild>
                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
