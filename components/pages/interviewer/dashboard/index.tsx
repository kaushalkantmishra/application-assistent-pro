"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  Star,
  Clock,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  CalendarDays,
  Play,
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import { AppLoader } from "@/components/app-loader"
import { toast } from "sonner"

interface BookingItem {
  id: string
  candidateName: string
  candidateEmail: string
  interviewType: string
  scheduledDate: string
  duration: number
  status: string
  meetingLink?: string
}

export default function InterviewerDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const [profRes, bookRes] = await Promise.all([
        fetch("/api/interviewer-profile"),
        fetch("/api/bookings"),
      ])

      if (profRes.ok) setProfile(await profRes.ok ? await profRes.json() : null)
      if (bookRes.ok) setBookings(await bookRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Booking request ${status.toLowerCase()}ed`)
        fetchDashboardData()
      } else {
        throw new Error("Failed to transition status")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return <AppLoader message="Retrieving your interviewer dashboard stats" />
  }

  const name = profile?.name ? profile.name.split(" ")[0] : "Interviewer"
  const pendingCount = bookings.filter(b => b.status === "Pending").length
  const confirmedCount = bookings.filter(b => b.status === "Accepted").length

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, Coach ${name}!`}
        description="Monitor candidate bookings, schedule availability calendar templates, and review candidate reports."
      >
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-primary text-white cursor-pointer gap-1.5 font-bold">
            <Link href="/interviewer/availability">
              <Calendar className="h-4 w-4" /> Manage Availability
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
              Confirmed Sessions <Calendar className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{confirmedCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Confirmed mock interviews</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
              Pending Requests <Clock className="h-4 w-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-850">{pendingCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
              Coach Rating <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{profile?.rating || "5.0"}</div>
            <p className="text-[10px] text-slate-400 mt-1">Based on candidate reviews</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
              Interviews Completed <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{profile?.totalInterviews || 0}</div>
            <p className="text-[10px] text-slate-400 mt-1">Completed training mocks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Confirmed Sessions List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b bg-slate-50/20">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarDays className="h-4.5 w-4.5 text-indigo-650" /> Confirmed Interview Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {bookings.filter(b => b.status === "Accepted").map((b) => {
                  const dateStr = new Date(b.scheduledDate).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                  return (
                    <div key={b.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 block">{b.interviewType}</span>
                        <span className="text-[10px] text-slate-500 block">Candidate: {b.candidateName} ({b.candidateEmail})</span>
                        <span className="text-[10px] text-indigo-600 font-bold block mt-1">{dateStr} ({b.duration} mins)</span>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" asChild className="h-8 text-[10px] border-slate-205 gap-1 font-bold">
                          <Link href={`/meetings/${b.id}`}>
                            <Play className="h-3 w-3 text-emerald-600 fill-emerald-600" /> Join Meeting
                          </Link>
                        </Button>
                        <Button size="sm" asChild className="h-8 text-[10px] bg-primary text-white gap-1 font-bold">
                          <Link href={`/feedback/submit?bookingId=${b.id}`}>
                            <ClipboardList className="h-3.5 w-3.5" /> Submit Scorecard
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {bookings.filter(b => b.status === "Accepted").length === 0 && (
                  <span className="text-xs text-slate-400 block text-center py-12">No upcoming confirmed sessions.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Booking Requests Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-slate-800">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-xs">
                {bookings.filter(b => b.status === "Pending").map((b) => {
                  const dateStr = new Date(b.scheduledDate).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                  return (
                    <div key={b.id} className="p-3.5 space-y-2 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block truncate">{b.interviewType}</span>
                        <span className="text-[10px] text-slate-500 block">Candidate: {b.candidateName}</span>
                        <span className="text-[10px] text-indigo-650 font-bold block">{dateStr} ({b.duration} mins)</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(b.id, "Rejected")}
                          className="flex-1 text-[10px] h-7 text-red-500 border-red-150 hover:bg-red-50 cursor-pointer font-semibold"
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(b.id, "Accepted")}
                          className="flex-1 text-[10px] h-7 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {bookings.filter(b => b.status === "Pending").length === 0 && (
                  <span className="text-xs text-slate-400 block text-center py-10">No pending session requests.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
