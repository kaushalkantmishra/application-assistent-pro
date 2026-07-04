"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { AppLoader } from "@/components/app-loader"
import {
  Users,
  Shield,
  TrendingUp,
  Settings,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  Ban,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  deletedAt: string | null
}

interface AnalyticsData {
  dau: number
  mau: number
  totalUsers: number
  premiumUsers: number
  totalResumes: number
  totalAISessions: number
  totalBookings: number
  revenue: number
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") // overview, users, settings
  
  // Settings state
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [seoTitle, setSeoTitle] = useState("")

  // Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  // Users list
  const [usersList, setUsersList] = useState<UserRow[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Load admin settings, analytics and users list
    Promise.all([
      fetch("/api/admin/settings").then(res => res.json()),
      fetch("/api/admin/analytics").then(res => res.json()),
      fetch("/api/admin/users").then(res => res.json())
    ]).then(([settingsData, analyticsData, usersData]) => {
      setMaintenanceMode(settingsData.maintenanceMode || false)
      setSeoTitle(settingsData.seo?.title || "")
      setAnalytics(analyticsData)
      setUsersList(Array.isArray(usersData) ? usersData : [])
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [])

  const handleToggleMaintenance = async (checked: boolean) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: checked,
          seo: { title: seoTitle }
        }),
      })
      if (res.ok) {
        setMaintenanceMode(checked)
        toast.success(`Maintenance mode turned ${checked ? "ON" : "OFF"}`)
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleUpdateSeo = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode,
          seo: { title: seoTitle }
        }),
      })
      if (res.ok) {
        toast.success("Branding and SEO tags updated successfully!")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          suspend: !currentSuspended,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUsersList(usersList.map(u => u.id === userId ? { ...u, deletedAt: updated.deletedAt } : u))
        toast.success(currentSuspended ? "User account activated" : "User account suspended")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const filteredUsers = usersList.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return <AppLoader message="Retrieving server logs, daily session counts and administrator profiles" />
  }

  return (
    <div className="space-y-8 font-sans text-xs w-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader
          title="Administration & Controls Panel"
          description="Manage active system components, review database registrations, monitor earnings analytics, and edit SEO configurations"
        />

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-center shrink-0 border dark:border-slate-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`text-xs font-bold py-1.5 px-4 rounded-md cursor-pointer transition-all ${
              activeTab === "overview" ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="h-3.5 w-3.5 inline mr-1" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`text-xs font-bold py-1.5 px-4 rounded-md cursor-pointer transition-all ${
              activeTab === "users" ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5 inline mr-1" /> Users list
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`text-xs font-bold py-1.5 px-4 rounded-md cursor-pointer transition-all ${
              activeTab === "settings" ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            <Settings className="h-3.5 w-3.5 inline mr-1" /> Settings
          </button>
        </div>
      </div>

      {activeTab === "overview" && analytics && (
        <div className="space-y-6">
          {/* Analytics Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="shadow-sm border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">DAILY ACTIVE USERS</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  {analytics.dau} <Activity className="h-5 w-5 text-indigo-650" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">TOTAL REGISTRATIONS</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  {analytics.totalUsers} <Users className="h-5 w-5 text-indigo-650" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">RESUMES COMPILED</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  {analytics.totalResumes} <FileText className="h-5 w-5 text-indigo-650" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-1.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ACCUMULATED REVENUE</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-emerald-650 flex items-center justify-between">
                  ${analytics.revenue.toFixed(2)} <TrendingUp className="h-5 w-5 text-emerald-650" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick status report */}
          <Card className="shadow-sm border border-slate-100 dark:border-slate-800">
            <CardHeader className="pb-3 border-b dark:border-b-slate-850 bg-slate-50/20 dark:bg-slate-900/20">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Shield className="h-4.5 w-4.5 text-indigo-650" /> System Diagnostics Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-3 leading-relaxed">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Platform status</span>
                <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none font-bold text-[9px]">ONLINE</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Active AI Mock Interviews completed</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.totalAISessions} sessions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Live human bookings completed</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.totalBookings} slots</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "users" && (
        <Card className="shadow-sm border border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-3 border-b dark:border-b-slate-850 bg-slate-50/20 dark:bg-slate-900/20 flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" /> Platform Registered Users
            </CardTitle>
            <Input
              placeholder="Filter users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-8 w-64 bg-white dark:bg-slate-900"
            />
          </CardHeader>
          <CardContent className="py-2.5">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                No users found matching query filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] font-bold h-8">User Details</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] font-bold h-8">Role Type</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] font-bold h-8">Created Date</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] font-bold h-8">Account Status</TableHead>
                    <TableHead className="text-slate-500 dark:text-slate-400 text-[10px] font-bold h-8 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <TableCell className="py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.name || "Anonymous"}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-755 dark:text-indigo-400 border-none font-bold text-[9px]">
                          {u.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400 py-3">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={
                          u.deletedAt ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-none" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none"
                        }>
                          {u.deletedAt ? "Suspended" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-3 flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleSuspend(u.id, !!u.deletedAt)}
                          className={`text-[9.5px] h-7 font-bold ${
                            u.deletedAt ? "text-emerald-650 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" : "text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
                          }`}
                        >
                          {u.deletedAt ? <Check className="h-3 w-3 mr-1" /> : <Ban className="h-3 w-3 mr-1" />}
                          {u.deletedAt ? "Activate" : "Suspend"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <Card className="shadow-sm border border-slate-100 dark:border-slate-800">
          <CardHeader className="pb-3 border-b dark:border-b-slate-850 bg-slate-50/20 dark:bg-slate-900/20">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-slate-550" /> System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="py-5 space-y-6">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 border dark:border-slate-800 rounded-xl bg-red-50/5 dark:bg-red-950/5">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" /> Maintenance Mode Lock
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">Turn this on to show a maintenance window warning message across all user routes.</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={handleToggleMaintenance} />
            </div>

            {/* SEO Settings */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b dark:border-b-slate-800 pb-1">Dynamic Branding & SEO Configurations</h4>
              
              <div className="space-y-1.5 max-w-lg">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Default Platform SEO Title</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. AI Career Coach Dashboard"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="text-xs h-9 bg-white dark:bg-slate-900"
                  />
                  <Button
                    onClick={handleUpdateSeo}
                    className="bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-350 text-white dark:text-slate-900 font-bold h-9 text-xs px-4"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
