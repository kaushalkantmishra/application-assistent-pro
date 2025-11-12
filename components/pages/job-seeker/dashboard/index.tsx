"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockApplications, mockUserProfile } from "@/lib/mock-data"
import { Plus, Calendar, TrendingUp, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const stats = {
    totalApplications: mockApplications.length,
    interviews: mockApplications.filter((app) => app.status === "Interview Scheduled").length,
    offers: mockApplications.filter((app) => app.status === "Offer Received").length,
    pending: mockApplications.filter((app) => app.status === "Applied").length,
  }

  const upcomingDeadlines = mockApplications
    .filter((app) => app.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3)

  const recentApplications = mockApplications
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 3)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${mockUserProfile.name.split(" ")[0]}!`}
        description="Here's an overview of your job application progress"
      >
        <Button asChild>
          <Link href="/applications">
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.interviews}</div>
            <p className="text-xs text-muted-foreground">Scheduled this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.offers}</div>
            <p className="text-xs text-muted-foreground">
              Success rate: {Math.round((stats.offers / stats.totalApplications) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Don't miss these important dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{app.company}</p>
                    <p className="text-sm text-muted-foreground">{app.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(app.deadline!).toLocaleDateString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {app.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest job applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{app.company}</p>
                  <p className="text-sm text-muted-foreground">{app.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{new Date(app.appliedDate).toLocaleDateString()}</p>
                  <Badge
                    variant={
                      app.status === "Offer Received"
                        ? "default"
                        : app.status === "Interview Scheduled"
                          ? "secondary"
                          : app.status === "Rejected"
                            ? "destructive"
                            : "outline"
                    }
                    className="text-xs"
                  >
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}