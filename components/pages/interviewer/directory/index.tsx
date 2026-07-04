"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, Calendar, Users, Github, Linkedin, Briefcase, DollarSign, MessageSquare, Plus } from "lucide-react"
import { AppLoader } from "@/components/app-loader"
import BookingWizard from "../booking-wizard"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface InterviewerProfile {
  id: string
  name: string
  email: string
  company: string
  role: string
  department: string
  experience: number
  specializations: string[]
  bio: string
  avatar?: string | null
  rating: number
  totalInterviews: number
  pricingType: string
  hourlyCharges: number
  interviewTypes: string[]
  languages?: string[]
}

const getAvatarPlaceholder = (name: string) => {
  const lowercaseName = name.toLowerCase()
  const isFemale = lowercaseName.includes("sarah") || 
                   lowercaseName.includes("aadhya") || 
                   lowercaseName.includes("jane") || 
                   lowercaseName.includes("priya") || 
                   lowercaseName.includes("emma") || 
                   lowercaseName.includes("lisa")
  if (isFemale) {
    return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  }
  return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
}

export default function InterviewerDirectoryPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<InterviewerProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all")
  const [selectedPricing, setSelectedPricing] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [loading, setLoading] = useState(true)

  // Booking wizard state
  const [bookingInterviewer, setBookingInterviewer] = useState<InterviewerProfile | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      if (searchTerm) query.append("search", searchTerm)
      if (selectedCompany !== "all") query.append("company", selectedCompany)
      if (selectedSpecialization !== "all") query.append("specialization", selectedSpecialization)
      if (selectedPricing !== "all") query.append("pricingType", selectedPricing)
      query.append("sortBy", sortBy)

      const res = await fetch(`/api/interviewers?${query.toString()}`)
      if (res.ok) {
        setProfiles(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [searchTerm, selectedCompany, selectedSpecialization, selectedPricing, sortBy])

  // Extract filter dropdown lists
  const companies = Array.from(new Set(profiles.map((p) => p.company).filter(Boolean)))
  const specializations = Array.from(new Set(profiles.flatMap((p) => p.specializations || []).filter(Boolean)))

  const handleStartChat = async (profile: InterviewerProfile) => {
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile.id }), // resolving target profile
      })

      if (res.ok) {
        const room = await res.json()
        router.push(`/interviewer/chat?roomId=${room.id}`)
      } else {
        throw new Error("Could not start chat session")
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviewer Directory"
        description="Find and book 1-on-1 interview preparation, technical mock challenges, or resume review sessions with industry leaders"
      />

      {/* FILTER CONTROLS */}
      <Card className="shadow-sm border-slate-100">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, bio, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9.5"
            />
          </div>

          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="text-xs h-9.5">
              <SelectValue placeholder="Filter by Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
            <SelectTrigger className="text-xs h-9.5">
              <SelectValue placeholder="Filter by Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Skills</SelectItem>
              {specializations.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPricing} onValueChange={setSelectedPricing}>
            <SelectTrigger className="text-xs h-9.5">
              <SelectValue placeholder="Pricing Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Pricing</SelectItem>
              <SelectItem value="free" className="text-xs">Free sessions</SelectItem>
              <SelectItem value="paid" className="text-xs">Paid sessions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="text-xs h-9.5">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating" className="text-xs">Top Rated</SelectItem>
              <SelectItem value="price_low" className="text-xs">Price: Low to High</SelectItem>
              <SelectItem value="price_high" className="text-xs">Price: High to Low</SelectItem>
              <SelectItem value="experience" className="text-xs">Highest Experience</SelectItem>
              <SelectItem value="recently_joined" className="text-xs">Recently Joined</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* DIRECTORY LISTINGS */}
      {loading ? (
        <div className="py-24">
          <AppLoader message="Retrieving interviewer directory profiles" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-slate-50/50">
          <Briefcase className="h-12 w-12 text-slate-350 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No Interviewers Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting filters or modifying your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="shadow-sm border hover:border-slate-300 transition-all border-slate-100 flex flex-col justify-between overflow-hidden">
              <CardHeader className="pb-3 flex flex-row gap-4 space-y-0">
                <Avatar className="h-14 w-14 border border-slate-100 shadow-sm shrink-0">
                  <AvatarImage src={profile.avatar || getAvatarPlaceholder(profile.name)} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-sm">
                    {profile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <CardTitle className="text-sm font-bold text-slate-800 truncate">
                      {profile.name}
                    </CardTitle>
                    <Badge className="bg-indigo-650 text-white font-bold text-[9px]">
                      {profile.pricingType === "free" ? "Free Session" : `$${profile.hourlyCharges}/hr`}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs font-semibold text-indigo-650 leading-relaxed truncate">
                    {profile.role} at {profile.company}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-[10px] text-slate-450 mt-0.5">
                    <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {profile.rating}</span>
                    <span>•</span>
                    <span>{profile.experience} yrs exp</span>
                    <span>•</span>
                    <span>{profile.totalInterviews} sessions</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-2 space-y-3 text-xs flex-1">
                <p className="text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                  {profile.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {profile.specializations?.slice(0, 4).map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-[9px] font-medium bg-slate-100 text-slate-700 border-none">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t flex justify-between items-center gap-3 bg-slate-50/50 pb-3 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartChat(profile)}
                  className="flex-1 text-xs gap-1 cursor-pointer font-bold border-indigo-200 text-indigo-700 bg-white"
                >
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
                <Button
                  size="sm"
                  onClick={() => setBookingInterviewer(profile)}
                  className="flex-1 text-xs gap-1 cursor-pointer bg-primary text-white font-bold"
                >
                  <Calendar className="h-4 w-4" /> Book Session
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Wizard Dialog launcher */}
      {bookingInterviewer && (
        <BookingWizard
          isOpen={true}
          onClose={() => setBookingInterviewer(null)}
          interviewer={bookingInterviewer}
        />
      )}
    </div>
  )
}