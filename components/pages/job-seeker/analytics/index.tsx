"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { AppLoader } from "@/components/app-loader"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("all")
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setApplications(data)
        } else {
          console.error("Failed to load applications array:", data)
          setApplications([])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch applications:", err)
        setLoading(false)
      })
  }, [])

  // Calculate analytics data
  const totalApplications = applications.length
  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const successRate = totalApplications > 0 ? Math.round(((statusCounts["Offer Received"] || 0) / totalApplications) * 100) : 0
  const interviewRate = totalApplications > 0 ? Math.round(((statusCounts["Interview Scheduled"] || 0) / totalApplications) * 100) : 0

  // Data for charts
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count: count as number,
    percentage: totalApplications > 0 ? Math.round(((count as number) / totalApplications) * 100) : 0,
  }))

  const pieData = statusData.map((item) => ({
    name: item.status,
    value: item.count,
  }))

  // Monthly stats
  const getMonthlyStats = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyMap = {} as Record<string, { month: string; applications: number; interviews: number; offers: number }>
    
    // Default last 4 months
    const today = new Date()
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const mLabel = months[d.getMonth()]
      monthlyMap[mLabel] = { month: mLabel, applications: 0, interviews: 0, offers: 0 }
    }

    applications.forEach((app) => {
      if (app.appliedDate) {
        const d = new Date(app.appliedDate)
        const mLabel = months[d.getMonth()]
        if (monthlyMap[mLabel]) {
          monthlyMap[mLabel].applications++
          if (app.status === "Interview Scheduled") {
            monthlyMap[mLabel].interviews++
          } else if (app.status === "Offer Received") {
            monthlyMap[mLabel].offers++
          }
        }
      }
    })

    return Object.values(monthlyMap)
  }

  const monthlyData = getMonthlyStats()

  // Company data
  const companyData = applications.reduce(
    (acc, app) => {
      acc[app.company] = (acc[app.company] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topCompanies = Object.entries(companyData)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }))

  // Upcoming deadlines
  const upcomingDeadlines = applications
    .filter((app) => app.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)

  const COLORS = ["#2563eb", "#10b981", "#64748b", "#ef4444", "#f59e0b"]

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

  if (loading) {
    return <AppLoader variant="radar" message="Compiling analytics & tracking indicators" />
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