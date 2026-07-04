"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Plus, Github, Linkedin, Globe, Code, Mail, Phone, MapPin, Briefcase, FileText } from "lucide-react"
import { AppLoader } from "@/components/app-loader"
import { toast } from "sonner"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newLocation, setNewLocation] = useState("")
  const [newLanguage, setNewLanguage] = useState("")

  const fetchProfile = () => {
    setLoading(true)
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          ...data,
          skills: data.skills || [],
          preferredLocations: data.preferredLocations || [],
          languages: data.languages || [],
          yearsOfExperience: data.yearsOfExperience ?? 0,
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load profile:", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSave = () => {
    fetch("/api/users/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: profile.phone,
        location: profile.location,
        education: profile.education,
        experience: profile.experience,
        skills: profile.skills,
        preferredLocations: profile.preferredLocations,
        resumeFileName: profile.resumeFileName,
        
        about: profile.about || "",
        currentDesignation: profile.currentDesignation || "",
        yearsOfExperience: Number(profile.yearsOfExperience) || 0,
        currentCompany: profile.currentCompany || "",
        currentSalary: profile.currentSalary || "",
        expectedSalary: profile.expectedSalary || "",
        preferredIndustry: profile.preferredIndustry || "",
        preferredWorkMode: profile.preferredWorkMode || "Remote",
        languages: profile.languages,

        // Social Links
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        portfolio: profile.portfolio || "",
        leetcode: profile.leetcode || "",
        geeksforgeeks: profile.geeksforgeeks || "",
        codechef: profile.codechef || "",
        codeforces: profile.codeforces || "",
        hackerrank: profile.hackerrank || "",
        hackerearth: profile.hackerearth || "",
        website: profile.website || "",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Profile saved successfully!")
        setProfile((prev: any) => ({ ...prev, ...data }))
        setIsEditing(false)
      })
      .catch((err) => {
        console.error("Failed to save profile:", err)
        toast.error("Failed to save profile changes")
      })
  }

  // Helpers
  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((skill: string) => skill !== skillToRemove) })
  }

  const addPreferredLocation = () => {
    if (newLocation.trim() && !profile.preferredLocations.includes(newLocation.trim())) {
      setProfile({ ...profile, preferredLocations: [...profile.preferredLocations, newLocation.trim()] })
      setNewLocation("")
    }
  }

  const removePreferredLocation = (locationToRemove: string) => {
    setProfile({
      ...profile,
      preferredLocations: profile.preferredLocations.filter((location: string) => location !== locationToRemove),
    })
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile({ ...profile, languages: [...profile.languages, newLanguage.trim()] })
      setNewLanguage("")
    }
  }

  const removeLanguage = (langToRemove: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((l: string) => l !== langToRemove),
    })
  }

  if (loading) {
    return <AppLoader message="Retrieving your profile preferences" />
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile Settings" description="Manage your professional experience, coding credentials, and dashboard parameters">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" className="bg-primary text-white cursor-pointer gap-1.5">
                <Save className="h-4 w-4" /> Save Details
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm" className="cursor-pointer">Edit Profile</Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: Basic & Professional Info */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border-slate-150">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary" /> Basic & Professional Details</CardTitle>
              <CardDescription className="text-xs">Your core personal details and work statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                  <Input value={profile.name || ""} disabled className="bg-slate-50 text-xs h-9.5" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                  <Input value={profile.email || ""} disabled className="bg-slate-50 text-xs h-9.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Phone</Label>
                  <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} className="text-xs h-9.5" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Location</Label>
                  <Input value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} disabled={!isEditing} className="text-xs h-9.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">About Me / Bio</Label>
                <Textarea value={profile.about || ""} onChange={(e) => setProfile({ ...profile, about: e.target.value })} disabled={!isEditing} className="text-xs leading-relaxed min-h-[90px]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Current Designation</Label>
                  <Input value={profile.currentDesignation || ""} onChange={(e) => setProfile({ ...profile, currentDesignation: e.target.value })} disabled={!isEditing} className="text-xs h-9.5" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Current Company</Label>
                  <Input value={profile.currentCompany || ""} onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })} disabled={!isEditing} className="text-xs h-9.5" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Experience (Years)</Label>
                  <Input type="number" value={profile.yearsOfExperience} onChange={(e) => setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })} disabled={!isEditing} className="text-xs h-9.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Expected Salary</Label>
                  <Input value={profile.expectedSalary || ""} onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })} disabled={!isEditing} placeholder="e.g. $140,000" className="text-xs h-9.5" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Work Mode Preference</Label>
                  {isEditing ? (
                    <Select value={profile.preferredWorkMode || "Remote"} onValueChange={(val) => setProfile({ ...profile, preferredWorkMode: val })}>
                      <SelectTrigger className="text-xs h-9.5 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote" className="text-xs cursor-pointer">💻 Remote</SelectItem>
                        <SelectItem value="Hybrid" className="text-xs cursor-pointer">🏢 Hybrid</SelectItem>
                        <SelectItem value="On-site" className="text-xs cursor-pointer">🚶 On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profile.preferredWorkMode || "Remote"} disabled className="bg-slate-50 text-xs h-9.5" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Education Details</Label>
                <Textarea value={profile.education || ""} onChange={(e) => setProfile({ ...profile, education: e.target.value })} disabled={!isEditing} className="text-xs leading-relaxed min-h-[80px]" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Experience History</Label>
                <Textarea value={profile.experience || ""} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} disabled={!isEditing} className="text-xs leading-relaxed min-h-[80px]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Social Links, Skills & Tags */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coding & Social URLs */}
          <Card className="shadow-sm border-slate-150">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" /> Social & Coding Accounts</CardTitle>
              <CardDescription className="text-xs">Direct links to your public profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-650 flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn</Label>
                <Input value={profile.linkedin || ""} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} disabled={!isEditing} placeholder="https://linkedin.com/in/username" className="text-xs h-8.5 font-mono" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-650 flex items-center gap-1.5"><Github className="h-3.5 w-3.5 text-slate-900" /> GitHub</Label>
                <Input value={profile.github || ""} onChange={(e) => setProfile({ ...profile, github: e.target.value })} disabled={!isEditing} placeholder="https://github.com/username" className="text-xs h-8.5 font-mono" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-650 flex items-center gap-1.5"><Code className="h-3.5 w-3.5 text-amber-500" /> LeetCode</Label>
                <Input value={profile.leetcode || ""} onChange={(e) => setProfile({ ...profile, leetcode: e.target.value })} disabled={!isEditing} placeholder="https://leetcode.com/username" className="text-xs h-8.5 font-mono" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-650 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-indigo-500" /> Portfolio</Label>
                <Input value={profile.portfolio || ""} onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })} disabled={!isEditing} placeholder="https://yourportfolio.com" className="text-xs h-8.5 font-mono" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-650 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-teal-600" /> Website</Label>
                <Input value={profile.website || ""} onChange={(e) => setProfile({ ...profile, website: e.target.value })} disabled={!isEditing} placeholder="https://yourwebsite.com" className="text-xs h-8.5 font-mono" />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Skills */}
          <Card className="shadow-sm border-slate-150">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Professional Skills</CardTitle>
              <CardDescription className="text-xs">Add your top developer capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skill (e.g. Next.js)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                    className="text-xs h-8.5"
                  />
                  <Button size="sm" onClick={addSkill} className="cursor-pointer h-8.5 text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 py-1 px-2 border flex items-center gap-1">
                    {skill}
                    {isEditing && (
                      <X className="h-3 w-3 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => removeSkill(skill)} />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card className="shadow-sm border-slate-150">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" /> Languages</CardTitle>
              <CardDescription className="text-xs">Spoken or written languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add language (e.g. Spanish)"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addLanguage()
                      }
                    }}
                    className="text-xs h-8.5"
                  />
                  <Button size="sm" onClick={addLanguage} className="cursor-pointer h-8.5 text-xs"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang: string) => (
                  <Badge key={lang} variant="secondary" className="text-[10px] bg-indigo-50/50 text-indigo-700 py-1 px-2 border border-indigo-100 flex items-center gap-1">
                    {lang}
                    {isEditing && (
                      <X className="h-3 w-3 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => removeLanguage(lang)} />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}