"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Users, Chrome, FileText, MessageSquare, Target, Zap, Sun, Moon } from "lucide-react"
import { useSession, signIn } from "next-auth/react"
import { AppLoader } from "@/components/app-loader"

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'user' | 'interviewer'>('user')
  const [animationPhase, setAnimationPhase] = useState(0)
  const { data: session, status } = useSession()
  const [theme, setTheme] = useState("dark")
  const router = useRouter()

  useEffect(() => {
    // Animation cycle
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
    }, 1500)

    if (typeof window !== "undefined") {
      const pref = localStorage.getItem("themePreference") || "dark"
      setTheme(pref)
      if (pref === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/")
    }
  }, [status, session, router])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("themePreference", newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background w-full">
        <AppLoader variant="radar" message="Authenticating session and preparing workspace" />
      </div>
    )
  }

  const handleGoogleLogin = () => {
    localStorage.setItem('selectedRole', selectedRole)
    signIn('google', { callbackUrl: '/' })
  }

  const features = [
    { icon: FileText, text: "Smart Resume Builder" },
    { icon: MessageSquare, text: "Interview Practice" },
    { icon: Target, text: "Job Matching" },
    { icon: Zap, text: "Career Insights" }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-to-br from-blue-50/10 via-indigo-50/5 to-purple-50/10 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      
      {/* Header Bar */}
      <header className="bg-card/85 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo and Project Name */}
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            
            {/* Project Name */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Application Assistant
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Career Companion</p>
            </div>
          </div>

          {/* Theme switcher */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full border-border bg-card text-foreground cursor-pointer"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-80px)] items-center">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Welcome Section */}
            <div className="text-center mb-6">
              <h3 className="text-3xl font-extrabold text-foreground mb-2">Welcome Back</h3>
              <p className="text-muted-foreground">Choose your role and continue your journey</p>
            </div>

            {/* Login Card */}
            <Card className="shadow-xl border border-border bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold text-foreground">Sign In</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select your role to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground text-center">I am a:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedRole === 'user' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('user')}
                      className={`h-auto p-4 flex flex-col items-center space-y-3 transition-all duration-200 cursor-pointer ${
                        selectedRole === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg' 
                          : 'hover:bg-blue-50/50 hover:border-blue-300 bg-card text-foreground'
                      }`}
                    >
                      <Briefcase className={`w-5 h-5 ${selectedRole === 'user' ? 'text-white' : 'text-blue-600'}`} />
                      <span className={`text-sm font-medium ${selectedRole === 'user' ? 'text-white' : 'text-foreground'}`}>
                        Job Seeker
                      </span>
                    </Button>
                    <Button
                      variant={selectedRole === 'interviewer' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('interviewer')}
                      className={`h-auto p-4 flex flex-col items-center space-y-3 transition-all duration-200 cursor-pointer ${
                        selectedRole === 'interviewer' 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg' 
                          : 'hover:bg-purple-50/50 hover:border-purple-300 bg-card text-foreground'
                      }`}
                    >
                      <Users className={`w-5 h-5 ${selectedRole === 'interviewer' ? 'text-white' : 'text-purple-600'}`} />
                      <span className={`text-sm font-medium ${selectedRole === 'interviewer' ? 'text-white' : 'text-foreground'}`}>
                        Interviewer
                      </span>
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6 border-border" />
                
                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full bg-card hover:bg-muted text-foreground border border-border shadow-sm h-12 text-base cursor-pointer font-medium transition-all duration-200 hover:shadow-md"
                  size="lg"
                >
                  <Chrome className="w-5 h-5 mr-3 text-indigo-500" />
                  Continue with Google
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Signing in as: <span className="font-semibold text-foreground">
                    {selectedRole === 'interviewer' ? 'Interviewer' : 'Job Seeker'}
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground">
                Secure authentication powered by Google
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Animated Logo and Features */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8">
          <div className="max-w-lg w-full text-center">
            {/* Animated Logo Section */}
            <div className="mb-8">
              <div className="relative">
                {/* Main Logo Container */}
                <div className="w-28 h-28 mx-auto mb-6 relative">
                  {/* Outer Ring Animation */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900/30 animate-spin" 
                       style={{ animationDuration: '3s' }}></div>
                  
                  {/* Middle Ring */}
                  <div className="absolute inset-2 rounded-full border-2 border-purple-200 dark:border-purple-900/30 animate-spin" 
                       style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                  
                  {/* Inner Logo */}
                  <div className="absolute inset-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Briefcase className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  
                  {/* Floating Elements */}
                  <div className={`absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full transition-all duration-1000 ${
                    animationPhase === 0 ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-60'
                  }`}></div>
                  <div className={`absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400 rounded-full transition-all duration-1000 ${
                    animationPhase === 1 ? 'transform translate-y-0 opacity-100' : 'transform translate-y-2 opacity-60'
                  }`}></div>
                  <div className={`absolute top-0 -left-6 w-4 h-4 bg-indigo-400 rounded-full transition-all duration-1000 ${
                    animationPhase === 2 ? 'transform translate-x-0 opacity-100' : 'transform -translate-x-2 opacity-60'
                  }`}></div>
                </div>
                
                {/* Project Title */}
                <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Application
                  </span>
                </h1>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Assistant
                  </span>
                </h2>
                
                {/* Animated Subtitle */}
                <p className="text-base text-muted-foreground mb-6 animate-fade-in">
                  Your AI-powered career companion for job applications and interviews
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div 
                    key={feature.text}
                    className={`bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border shadow-sm transition-all duration-500 hover:shadow-md hover:bg-card/85 ${
                      animationPhase === index ? 'transform scale-105 shadow-lg' : ''
                    }`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">{feature.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}