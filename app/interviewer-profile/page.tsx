"use client"

import { AppLayout } from "@/components/app-layout"
import { RoleGuard } from "@/components/role-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockInterviewerProfiles } from "@/lib/mock-data"
import { Star, Github, Linkedin, MapPin, Edit, Save, X } from "lucide-react"
import { useState } from "react"

export default function InterviewerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // For demo purposes, using the first interviewer profile
  const profile = mockInterviewerProfiles[0]

  const [editedProfile, setEditedProfile] = useState({
    bio: profile.bio,
    specializations: profile.specializations.join(", "),
    linkedIn: profile.linkedIn || "",
    github: profile.github || "",
  })

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile({
      bio: profile.bio,
      specializations: profile.specializations.join(", "),
      linkedIn: profile.linkedIn || "",
      github: profile.github || "",
    })
    setIsEditing(false)
  }

  return (
    <RoleGuard
      allowedRoles={["interviewer"]}
      fallbackMessage="This page is only accessible to interviewer accounts to manage their profile."
    >
      <AppLayout>
        <PageHeader title="My Interviewer Profile" description="Manage your interviewer profile and availability">
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback className="text-2xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="text-lg">{profile.role}</CardDescription>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.company}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-lg">{profile.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg mb-1">{profile.totalInterviews}</div>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{profile.experience} years</span>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">{new Date(profile.joinedDate).toLocaleDateString()}</span>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2 pt-4">
                  {isEditing ? (
                    <div className="w-full space-y-2">
                      <Input
                        placeholder="LinkedIn URL"
                        value={editedProfile.linkedIn}
                        onChange={(e) => setEditedProfile({ ...editedProfile, linkedIn: e.target.value })}
                      />
                      <Input
                        placeholder="GitHub URL"
                        value={editedProfile.github}
                        onChange={(e) => setEditedProfile({ ...editedProfile, github: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      {profile.linkedIn && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-1" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {profile.github && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={profile.github} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
                <CardDescription>Tell candidates about your interview style and experience</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={4}
                    placeholder="Describe your interview approach and experience..."
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Interview Types */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Types</CardTitle>
                <CardDescription>Types of interviews you conduct</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.interviewTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="px-3 py-1">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
                <CardDescription>Your areas of expertise</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={editedProfile.specializations}
                    onChange={(e) => setEditedProfile({ ...editedProfile, specializations: e.target.value })}
                    placeholder="React, Node.js, System Design, etc."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="px-3 py-1">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>When you're available for interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Available Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.availability.days.map((day) => (
                        <Badge key={day} variant="secondary" className="px-3 py-1">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Time Slots</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.availability.timeSlots.map((slot) => (
                        <Badge key={slot} variant="outline" className="px-3 py-1">
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
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  )
}
