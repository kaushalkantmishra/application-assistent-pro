"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { AppLoader } from "@/components/app-loader"

interface BookingItem {
  id: string
  candidateName: string
  dateTime: string
  category: string
  status: string
}

export default function InterviewerDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/interviewer-profile").then((res) => res.ok ? res.json() : null),
    ])
      .then(([profileData]) => {
        setProfile(profileData)
        // Set some realistic mock bookings for a rich look
        setBookings([
          {
            id: "b1",
            candidateName: "Kaushal Kant Mishra",
            dateTime: "July 5, 2026 at 3:00 PM",
            category: "System Design Mock",
            status: "Scheduled"
          },
          {
            id: "b2",
            candidateName: "Aadhya Sharma",
            dateTime: "July 8, 2026 at 10:00 AM",
            category: "Frontend/React Deep-Dive",
            status: "Pending Confirmation"
          }
        ])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load interviewer dashboard data:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <AppLoader message="Retrieving your interviewer dashboard stats" />
  }

  const name = profile?.name ? profile.name.split(" ")[0] : "Interviewer"

  return (
    <>
      <PageHeader
        title={`Welcome back, Coach ${name}!`}
        description="Monitor candidates bookings, feedback ratings, and manage your availability calendar."
      >
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-primary text-white cursor-pointer gap-1.5">
            <Link href="/interviewer/availability">
              <Calendar className="h-4 w-4" /> Manage Availability
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {bookings.filter(b => b.status === "Scheduled").length}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Confirmed mock interviews</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Interviews Conducted</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-505" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{profile?.totalInterviews || 0}</div>
            <p className="text-[10px] text-slate-400 mt-1">All-time candidates reviewed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Interviewer Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{profile?.rating || "5.0"} / 5.0</div>
            <p className="text-[10px] text-slate-400 mt-1">Feedback from developers</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">Pricing Tier</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 capitalize">
              {profile?.pricingType === "free" ? "Free" : `$${profile?.hourlyCharges}/hr`}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Session billing structure</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification & Action Hub */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-indigo-150 bg-indigo-50/5 relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                {profile?.verificationStatus === "verified" ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Instructor
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 text-amber-500" /> Verification Pending
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-xs">Interviewer credentials validation status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                {profile?.verificationStatus === "verified" 
                  ? "Your profile is fully verified. You can receive booking requests from job seekers and host online sessions."
                  : "We are currently checking your professional resume and linked accounts. Verified instructors show up in candidate searches."}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Interviewer Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/interviewer-profile">
                  <span>Update Profile Info</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/interviewer/availability">
                  <span>Manage Calendars</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="justify-between text-xs cursor-pointer group">
                <Link href="/interviewer/candidates">
                  <span>View Candidate History</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bookings & Active Availability */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Candidate Bookings</CardTitle>
              <CardDescription className="text-xs">Incoming and scheduled mock interviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div key={booking.id} className="p-3.5 border rounded-lg flex items-center justify-between hover:bg-slate-50/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{booking.candidateName}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{booking.dateTime} • {booking.category}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase ${booking.status === 'Scheduled' ? 'text-indigo-650 bg-indigo-55/10 border-indigo-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                      {booking.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-lg">
                  No upcoming bookings.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
