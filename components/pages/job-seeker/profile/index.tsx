"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Upload, X, Plus } from "lucide-react"
import { AppLoader } from "@/components/app-loader"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newRole, setNewRole] = useState("")
  const [newCompany, setNewCompany] = useState("")
  const [newLocation, setNewLocation] = useState("")

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        // Ensure arrays are initialized
        setProfile({
          ...data,
          skills: data.skills || [],
          preferredRoles: data.preferredRoles || [],
          preferredCompanies: data.preferredCompanies || [],
          preferredLocations: data.preferredLocations || [],
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load profile:", err)
        setLoading(false)
      })
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
        preferredRoles: profile.preferredRoles,
        preferredCompanies: profile.preferredCompanies,
        preferredLocations: profile.preferredLocations,
        resumeFileName: profile.resumeFileName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile((prev: any) => ({ ...prev, ...data }))
        setIsEditing(false)
      })
      .catch((err) => {
        console.error("Failed to save profile:", err)
      })
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] })
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((skill: string) => skill !== skillToRemove) })
  }

  const addPreferredRole = () => {
    if (newRole.trim() && !profile.preferredRoles.includes(newRole.trim())) {
      setProfile({ ...profile, preferredRoles: [...profile.preferredRoles, newRole.trim()] })
      setNewRole("")
    }
  }

  const removePreferredRole = (roleToRemove: string) => {
    setProfile({ ...profile, preferredRoles: profile.preferredRoles.filter((role: string) => role !== roleToRemove) })
  }

  const addPreferredCompany = () => {
    if (newCompany.trim() && !profile.preferredCompanies.includes(newCompany.trim())) {
      setProfile({ ...profile, preferredCompanies: [...profile.preferredCompanies, newCompany.trim()] })
      setNewCompany("")
    }
  }

  const removePreferredCompany = (companyToRemove: string) => {
    setProfile({
      ...profile,
      preferredCompanies: profile.preferredCompanies.filter((company: string) => company !== companyToRemove),
    })
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

  if (loading) {
    return <AppLoader message="Retrieving your profile & job preferences" />
  }

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information and job preferences">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic contact and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                disabled={!isEditing}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="experience">Experience</Label>
              <Textarea
                id="experience"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                disabled={!isEditing}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Upload and manage your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.resumeFileName ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">{profile.resumeFileName}</span>
                  <Button variant="outline" size="sm" disabled={!isEditing}>
                    Replace
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No resume uploaded</p>
                  <Button variant="outline" size="sm" disabled={!isEditing}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferred Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Roles</CardTitle>
            <CardDescription>Job roles you're interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.preferredRoles.map((role: string) => (
                  <Badge key={role} variant="outline" className="flex items-center gap-1">
                    {role}
                    {isEditing && (
                      <button onClick={() => removePreferredRole(role)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a preferred role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPreferredRole()}
                  />
                  <Button onClick={addPreferredRole} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferred Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Companies</CardTitle>
            <CardDescription>Companies you'd like to work for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.preferredCompanies.map((company: string) => (
                  <Badge key={company} variant="outline" className="flex items-center gap-1">
                    {company}
                    {isEditing && (
                      <button onClick={() => removePreferredCompany(company)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a preferred company"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPreferredCompany()}
                  />
                  <Button onClick={addPreferredCompany} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferred Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Locations</CardTitle>
            <CardDescription>Locations where you'd like to work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.preferredLocations.map((location: string) => (
                  <Badge key={location} variant="outline" className="flex items-center gap-1">
                    {location}
                    {isEditing && (
                      <button
                        onClick={() => removePreferredLocation(location)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a preferred location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPreferredLocation()}
                  />
                  <Button onClick={addPreferredLocation} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}