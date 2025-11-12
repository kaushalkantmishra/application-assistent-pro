"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockInterviewerProfiles } from "@/lib/mock-data"
import { Search, Star, Calendar, Users, Github, Linkedin, MapPin, Briefcase } from "lucide-react"

const interviewTypeColors = {
  Technical: "bg-blue-100 text-blue-800",
  Behavioral: "bg-green-100 text-green-800",
  "System Design": "bg-purple-100 text-purple-800",
  HR: "bg-orange-100 text-orange-800",
}

export default function InterviewerProfilesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all")
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>("all")

  const companies = Array.from(new Set(mockInterviewerProfiles.map((profile) => profile.company)))
  const specializations = Array.from(new Set(mockInterviewerProfiles.flatMap((profile) => profile.specializations)))
  const interviewTypes = Array.from(new Set(mockInterviewerProfiles.flatMap((profile) => profile.interviewTypes)))

  const filteredProfiles = mockInterviewerProfiles.filter((profile) => {
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

  return (
    <>
      <PageHeader title="Interviewer Profiles" description="Connect with experienced interviewers from top companies">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {filteredProfiles.length} Active Interviewers
          </Badge>
        </div>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Find Interviewers</CardTitle>
          <CardDescription>Filter by company, specialization, or interview type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </>
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