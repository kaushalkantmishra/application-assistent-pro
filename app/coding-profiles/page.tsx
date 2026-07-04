"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { RoleGuard } from "@/components/role-guard"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLoader } from "@/components/app-loader"
import { 
  Github, 
  Linkedin, 
  Globe, 
  Code, 
  CheckCircle2, 
  Link2, 
  AlertCircle, 
  RefreshCw,
  Unlink
} from "lucide-react"
import { toast } from "sonner"

interface CodingProfile {
  id: string
  provider: string
  url: string
  username?: string | null
  status: string
  lastSyncedAt?: string | null
}

const PROVIDERS = [
  { id: "github", name: "GitHub", icon: Github, color: "text-slate-900 bg-slate-50", placeholder: "https://github.com/username" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600 bg-blue-50", placeholder: "https://linkedin.com/in/username" },
  { id: "leetcode", name: "LeetCode", icon: Code, color: "text-amber-500 bg-amber-50", placeholder: "https://leetcode.com/username" },
  { id: "geeksforgeeks", name: "GeeksforGeeks", icon: Code, color: "text-emerald-600 bg-emerald-50", placeholder: "https://auth.geeksforgeeks.org/user/username" },
  { id: "codechef", name: "CodeChef", icon: Code, color: "text-yellow-700 bg-yellow-50", placeholder: "https://codechef.com/users/username" },
  { id: "codeforces", name: "Codeforces", icon: Code, color: "text-red-500 bg-red-50", placeholder: "https://codeforces.com/profile/username" },
  { id: "hackerrank", name: "HackerRank", icon: Code, color: "text-green-500 bg-green-50", placeholder: "https://hackerrank.com/username" },
  { id: "hackerearth", name: "HackerEarth", icon: Code, color: "text-indigo-500 bg-indigo-50", placeholder: "https://hackerearth.com/@username" },
  { id: "portfolio", name: "Personal Portfolio", icon: Globe, color: "text-purple-600 bg-purple-50", placeholder: "https://yourportfolio.com" },
  { id: "website", name: "Personal Website", icon: Globe, color: "text-teal-600 bg-teal-50", placeholder: "https://yourwebsite.com" },
]

export default function CodingProfilesRoute() {
  const [profiles, setProfiles] = useState<CodingProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [usernames, setUsernames] = useState<Record<string, string>>({})
  const [savingProvider, setSavingProvider] = useState<string | null>(null)

  // Fetch connected profiles
  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/coding-profiles")
      if (res.ok) {
        const data = await res.json()
        setProfiles(data)
        
        // Populate inputs
        const initialUrls: Record<string, string> = {}
        const initialUsernames: Record<string, string> = {}
        data.forEach((p: CodingProfile) => {
          initialUrls[p.provider] = p.url
          initialUsernames[p.provider] = p.username || ""
        })
        setUrls(initialUrls)
        setUsernames(initialUsernames)
      } else {
        toast.error("Failed to load connected profiles")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load connected profiles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  // Action: Connect or update a profile
  const handleConnect = async (providerId: string) => {
    const url = urls[providerId]
    if (!url || !url.trim()) {
      toast.error("Please enter a profile URL")
      return
    }

    try {
      setSavingProvider(providerId)
      const res = await fetch("/api/coding-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          url: url.trim(),
          username: usernames[providerId]?.trim() || "",
        }),
      })

      if (res.ok) {
        toast.success(`Successfully connected ${PROVIDERS.find(p => p.id === providerId)?.name || providerId}`)
        fetchProfiles()
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to connect profile")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect profile")
    } finally {
      setSavingProvider(null)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AppLayout>
          <AppLoader message="Retrieving your connected coding & professional profiles" />
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["user"]} fallbackMessage="This page is only accessible to job seeker accounts.">
        <AppLayout>
          <PageHeader 
            title="Coding & Developer Profiles" 
            description="Connect and centralize your external coding profiles, developer portfolios, and resume details"
          />

          <div className="mt-6 w-full space-y-6">
            <Card className="border-indigo-100 bg-indigo-50/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-700">
                  <AlertCircle className="h-4 w-4 shrink-0" /> Developer Profile Integration
                </CardTitle>
                <CardDescription className="text-xs text-indigo-650">
                  Connecting these profiles allows the Career platform to extract your public statistics, coding achievements, and latest updates to display on your Career Dashboard and enhance mock interview questions.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROVIDERS.map((prov) => {
                const connectedProfile = profiles.find(p => p.provider === prov.id)
                const isSaving = savingProvider === prov.id
                const Icon = prov.icon

                return (
                  <Card key={prov.id} className="shadow-sm border border-slate-100 hover:border-slate-200 transition-all">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${prov.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold">{prov.name}</CardTitle>
                          <CardDescription className="text-[10px]">Manual profile verification</CardDescription>
                        </div>
                      </div>

                      {connectedProfile ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-55/10 border-emerald-200 font-bold gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500 bg-slate-50 border-slate-250">
                          Not Connected
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3.5">
                      {/* URL Input */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-700">Profile URL</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder={prov.placeholder}
                            value={urls[prov.id] || ""}
                            onChange={(e) => setUrls({ ...urls, [prov.id]: e.target.value })}
                            className="text-xs h-8.5 font-mono"
                          />
                        </div>
                      </div>

                      {/* Username Input (Optional) */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-700">Username / Handle (Optional)</Label>
                        <Input
                          placeholder="e.g. kaushalkant"
                          value={usernames[prov.id] || ""}
                          onChange={(e) => setUsernames({ ...usernames, [prov.id]: e.target.value })}
                          className="text-xs h-8.5"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() => handleConnect(prov.id)}
                          className={`h-8 text-xs cursor-pointer gap-1.5 ${
                            connectedProfile 
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border" 
                              : "bg-primary text-white"
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                            </>
                          ) : connectedProfile ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5" /> Update Profile
                            </>
                          ) : (
                            <>
                              <Link2 className="h-3.5 w-3.5" /> Connect Profile
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </AuthGuard>
  )
}
