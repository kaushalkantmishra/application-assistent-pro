"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { mockApplications } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Calendar, TrendingUp, Target, Clock, Award, AlertCircle } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("all")

  // Calculate analytics data
  const totalApplications = mockApplications.length
  const statusCounts = mockApplications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const successRate = Math.round(((statusCounts["Offer Received"] || 0) / totalApplications) * 100)
  const interviewRate = Math.round(((statusCounts["Interview Scheduled"] || 0) / totalApplications) * 100)

  // Data for charts
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / totalApplications) * 100),
  }))

  const pieData = statusData.map((item) => ({
    name: item.status,
    value: item.count,
  }))

  // Monthly application data (mock)
  const monthlyData = [
    { month: "Oct", applications: 2, interviews: 1, offers: 0 },
    { month: "Nov", applications: 3, interviews: 2, offers: 1 },
    { month: "Dec", applications: 4, interviews: 1, offers: 0 },
    { month: "Jan", applications: 6, interviews: 3, offers: 2 },
  ]

  // Company data
  const companyData = mockApplications.reduce(
    (acc, app) => {
      acc[app.company] = (acc[app.company] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topCompanies = Object.entries(companyData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }))

  // Upcoming deadlines
  const upcomingDeadlines = mockApplications
    .filter((app) => app.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)

  const COLORS = ["#0891b2", "#ec4899", "#4b5563", "#be123c", "#f9fafb"]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Offer Received":
        return "default"
      case "Interview Scheduled":
        return "secondary"
      case "Rejected":
        return "destructive"
      case "Applied":
        return "outline"
      case "Saved":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <>
      <PageHeader title="Analytics" description="Track your job application performance and trends">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="1month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Offers received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{interviewRate}%</div>
            <p className="text-xs text-muted-foreground">Applications to interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {statusCounts["Applied"] + statusCounts["Interview Scheduled"] || 0}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">5.2</div>
            <p className="text-xs text-muted-foreground">Days (estimated)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Application Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
            <CardDescription>Breakdown of your application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Application Trends</CardTitle>
            <CardDescription>Track your application activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="applications" stroke="#0891b2" strokeWidth={2} name="Applications" />
                  <Line type="monotone" dataKey="interviews" stroke="#ec4899" strokeWidth={2} name="Interviews" />
                  <Line type="monotone" dataKey="offers" stroke="#4b5563" strokeWidth={2} name="Offers" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Company</CardTitle>
            <CardDescription>Companies you've applied to most</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompanies} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="company" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important dates to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((app) => {
                  const deadline = new Date(app.deadline!)
                  const today = new Date()
                  const diffTime = deadline.getTime() - today.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  const isUrgent = diffDays <= 3 && diffDays >= 0

                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{app.company}</p>
                        <p className="text-sm text-muted-foreground">{app.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{deadline.toLocaleDateString()}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(app.status)} className="text-xs">
                            {app.status}
                          </Badge>
                          {isUrgent && <AlertCircle className="h-4 w-4 text-destructive" />}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}