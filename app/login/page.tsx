"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  const router = useRouter()
  const { user, login } = useAuth()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleLogin = (role: 'user' | 'interviewer') => {
    login(role)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Application Assistant</CardTitle>
          <CardDescription className="text-gray-600">
            Dummy login - Choose your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              onClick={() => handleLogin('user')}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              size="lg"
            >
              Login as Job Seeker
            </Button>
            
            <Button
              onClick={() => handleLogin('interviewer')}
              className="w-full bg-pink-600 hover:bg-pink-700"
              size="lg"
            >
              Login as Interviewer
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Available roles:</p>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                  Job Seeker
                </Badge>
                <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                  Interviewer
                </Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">This is a temporary dummy login system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
