"use client"

import { RoleGuard } from "@/components/role-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Star, Github, Linkedin, MapPin, Edit, Save, X, Globe, DollarSign, Calendar } from "lucide-react"
import { AppLoader } from "@/components/app-loader"
import { toast } from "sonner"

export default function InterviewerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editedProfile, setEditedProfile] = useState({
    bio: "",
    specializations: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    pricingType: "free",
    hourlyCharges: 0,
    languages: "",
    interviewCategories: "",
  })

  useEffect(() => {
    fetch("/api/interviewer-profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data)
        setEditedProfile({
          bio: data.bio || "",
          specializations: data.specializations ? data.specializations.join(", ") : "",
          linkedIn: data.linkedIn || "",
          github: data.github || "",
          portfolio: data.portfolio || "",
          pricingType: data.pricingType || "free",
          hourlyCharges: data.hourlyCharges ?? 0,
          languages: data.languages ? data.languages.join(", ") : "",
          interviewCategories: data.interviewCategories ? data.interviewCategories.join(", ") : "",
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load profile:", err)
        setLoading(false)
      })
  }, [])

  const handleSave = () => {
    const specs = editedProfile.specializations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const langs = editedProfile.languages
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean)

    const cats = editedProfile.interviewCategories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)

    fetch("/api/interviewer-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profile.name,
        bio: editedProfile.bio,
        specializations: specs,
        linkedIn: editedProfile.linkedIn,
        github: editedProfile.github,
        portfolio: editedProfile.portfolio,
        pricingType: editedProfile.pricingType,
        hourlyCharges: Number(editedProfile.hourlyCharges) || 0,
        languages: langs,
        interviewCategories: cats,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Profile saved successfully!")
        setProfile(data)
        setIsEditing(false)
      })
      .catch((err) => {
        console.error("Failed to save profile:", err)
        toast.error("Failed to save profile changes")
      })
  }

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({
        bio: profile.bio || "",
        specializations: profile.specializations ? profile.specializations.join(", ") : "",
        linkedIn: profile.linkedIn || "",
        github: profile.github || "",
        portfolio: profile.portfolio || "",
        pricingType: profile.pricingType || "free",
        hourlyCharges: profile.hourlyCharges ?? 0,
        languages: profile.languages ? profile.languages.join(", ") : "",
        interviewCategories: profile.interviewCategories ? profile.interviewCategories.join(", ") : "",
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <RoleGuard
        allowedRoles={["interviewer"]}
        fallbackMessage="This page is only accessible to interviewer accounts to manage their profile."
      >
        <AppLoader message="Retrieving your interviewer settings & profile details" />
      </RoleGuard>
    )
  }

  return (
    <RoleGuard
      allowedRoles={["interviewer"]}
      fallbackMessage="This page is only accessible to interviewer accounts to manage their profile."
    >
      <PageHeader title="My Interviewer Profile" description="Manage your interviewer profile and availability">
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} size="sm" className="cursor-pointer">
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit Profile
            </>
          )}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="text-center pb-4">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-xl font-bold bg-indigo-50 text-indigo-700">
                  {profile.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-bold">{profile.name}</CardTitle>
              <CardDescription className="text-xs">{profile.role} at {profile.company}</CardDescription>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px] text-emerald-650 bg-emerald-50 border-emerald-250 font-bold uppercase">
                  {profile.verificationStatus || "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="font-bold text-sm">{profile.rating}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Rating</p>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm mb-0.5">{profile.totalInterviews}</div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Interviews</p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Experience</span>
                <span className="font-bold">{profile.experience} years</span>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Member Since</span>
                <span className="font-bold">{new Date(profile.joinedDate).toLocaleDateString()}</span>
              </div>

              {/* Pricing Type */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Session Rate</span>
                <span className="font-bold text-indigo-700 capitalize">
                  {profile.pricingType === "free" ? "Free" : `$${profile.hourlyCharges || 0}/hr`}
                </span>
              </div>

              {/* Social Links View/Edit */}
              <div className="space-y-3 pt-3 border-t">
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-700">LinkedIn URL</Label>
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        value={editedProfile.linkedIn}
                        onChange={(e) => setEditedProfile({ ...editedProfile, linkedIn: e.target.value })}
                        className="text-xs h-8.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-700">GitHub URL</Label>
                      <Input
                        placeholder="https://github.com/..."
                        value={editedProfile.github}
                        onChange={(e) => setEditedProfile({ ...editedProfile, github: e.target.value })}
                        className="text-xs h-8.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-700">Portfolio URL</Label>
                      <Input
                        placeholder="https://..."
                        value={editedProfile.portfolio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, portfolio: e.target.value })}
                        className="text-xs h-8.5"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.linkedIn && (
                      <Button size="sm" variant="outline" asChild className="h-7 text-[10px] font-bold">
                        <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-3 w-3 mr-1 text-blue-600" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {profile.github && (
                      <Button size="sm" variant="outline" asChild className="h-7 text-[10px] font-bold">
                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-3 w-3 mr-1 text-slate-900" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {profile.portfolio && (
                      <Button size="sm" variant="outline" asChild className="h-7 text-[10px] font-bold">
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-3 w-3 mr-1 text-indigo-600" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">About Me</CardTitle>
              <CardDescription className="text-xs">Tell candidates about your interview style and experience</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={4}
                  placeholder="Describe your interview approach and experience..."
                  className="text-xs leading-relaxed"
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">{profile.bio || "No biography provided."}</p>
              )}
            </CardContent>
          </Card>

          {/* Specializations & Categories */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Specializations & Interview Domains</CardTitle>
              <CardDescription className="text-xs">Categories and subjects you offer mock interviews for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Specializations (Skills)</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.specializations}
                    onChange={(e) => setEditedProfile({ ...editedProfile, specializations: e.target.value })}
                    placeholder="e.g. React, Node.js, System Design, Go"
                    className="text-xs h-9.5"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specializations && profile.specializations.length > 0 ? (
                      profile.specializations.map((spec: string) => (
                        <Badge key={spec} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 py-1 px-2 border">
                          {spec}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None specified.</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold text-slate-700">Interview Categories</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.interviewCategories}
                    onChange={(e) => setEditedProfile({ ...editedProfile, interviewCategories: e.target.value })}
                    placeholder="e.g. Frontend, Backend, System Design, Behavioral"
                    className="text-xs h-9.5"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interviewCategories && profile.interviewCategories.length > 0 ? (
                      profile.interviewCategories.map((cat: string) => (
                        <Badge key={cat} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100 py-1 px-2 border">
                          {cat}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None specified.</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Language Settings */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Rates & Languages</CardTitle>
              <CardDescription className="text-xs">Your consultation fee model and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Fee Structure</Label>
                  {isEditing ? (
                    <Select value={editedProfile.pricingType} onValueChange={(val) => setEditedProfile({ ...editedProfile, pricingType: val })}>
                      <SelectTrigger className="text-xs h-9.5 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free" className="text-xs cursor-pointer">Free (Mentorship)</SelectItem>
                        <SelectItem value="paid" className="text-xs cursor-pointer">Paid (Hourly Rate)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.pricingType === "free" ? "Free" : "Paid"} disabled className="bg-slate-50 text-xs h-9.5" />
                  )}
                </div>

                {editedProfile.pricingType === "paid" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Hourly Charge ($)</Label>
                    <Input
                      type="number"
                      value={editedProfile.hourlyCharges}
                      onChange={(e) => setEditedProfile({ ...editedProfile, hourlyCharges: Number(e.target.value) || 0 })}
                      disabled={!isEditing}
                      className="text-xs h-9.5"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold text-slate-700">Languages</Label>
                {isEditing ? (
                  <Input
                    value={editedProfile.languages}
                    onChange={(e) => setEditedProfile({ ...editedProfile, languages: e.target.value })}
                    placeholder="e.g. English, Hindi, Spanish"
                    className="text-xs h-9.5"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.languages && profile.languages.length > 0 ? (
                      profile.languages.map((lang: string) => (
                        <Badge key={lang} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 py-1 px-2 border">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None specified.</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> Availability Settings</CardTitle>
              <CardDescription className="text-xs">Your consultation calendar and time-slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold mb-2 text-slate-700">Available Days</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.availability?.days?.map((day: string) => (
                      <Badge key={day} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 py-1 px-2 border">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold mb-2 text-slate-700">Time Slots</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.availability?.timeSlots?.map((slot: string) => (
                      <Badge key={slot} variant="outline" className="text-[10px] py-1 px-2">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" className="bg-primary text-white cursor-pointer gap-1.5">
                <Save className="h-4 w-4" /> Save Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  )
}