"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { mockGovtJobs, type GovtJob } from "@/lib/mock-data"
import { Search, MapPin, Calendar, Users, ExternalLink, Building2 } from "lucide-react"

export default function GovtJobsPage() {
  const [jobs] = useState<GovtJob[]>(mockGovtJobs)
  const [filteredJobs, setFilteredJobs] = useState<GovtJob[]>(mockGovtJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // Get unique departments and locations for filters
  const departments = Array.from(new Set(jobs.map((job) => job.department)))
  const locations = Array.from(new Set(jobs.map((job) => job.location)))

  // Filter jobs
  const filterJobs = () => {
    let filtered = jobs

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.eligibility.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((job) => job.department === departmentFilter)
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.location === locationFilter)
    }

    setFilteredJobs(filtered)
  }

  // Apply filters when dependencies change
  useState(() => {
    filterJobs()
  })

  const isDeadlineNear = (lastDate: string) => {
    const deadline = new Date(lastDate)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }

  return (
    <AppLayout>
        <PageHeader title="Government Jobs" description="Browse and apply for government job openings">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{filteredJobs.length} jobs available</span>
          </div>
        </PageHeader>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, departments, or eligibility..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setTimeout(filterJobs, 100)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={departmentFilter}
                onValueChange={(value) => {
                  setDepartmentFilter(value)
                  setTimeout(filterJobs, 100)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={locationFilter}
                onValueChange={(value) => {
                  setLocationFilter(value)
                  setTimeout(filterJobs, 100)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-base">{job.department}</CardDescription>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      {isDeadlineNear(job.lastDate) && (
                        <Badge variant="destructive" className="w-fit">
                          Deadline Soon
                        </Badge>
                      )}
                      <Button asChild>
                        <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                          Apply Now
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(job.lastDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{job.vacancies} vacancies</span>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Eligibility Requirements</h4>
                    <p className="text-sm text-muted-foreground">{job.eligibility}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No government jobs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
    </AppLayout>
  )
}
