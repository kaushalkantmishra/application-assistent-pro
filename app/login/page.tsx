"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Users, Chrome, FileText, MessageSquare, Target, Zap } from "lucide-react"

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'user' | 'interviewer'>('user')
  const [animationPhase, setAnimationPhase] = useState(0)

  // Simulate authentication check
  useEffect(() => {
    // Animation cycle
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  const handleGoogleLogin = () => {
    // localStorage.setItem('selectedRole', selectedRole)
    // signIn('google', { callbackUrl: '/' })
    console.log('Signing in with role:', selectedRole)
  }

  const features = [
    { icon: FileText, text: "Smart Resume Builder" },
    { icon: MessageSquare, text: "Interview Practice" },
    { icon: Target, text: "Job Matching" },
    { icon: Zap, text: "Career Insights" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h3>
            <p className="text-gray-600">Choose your role and continue your journey</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Sign In</CardTitle>
              <CardDescription className="text-gray-600">
                Select your role to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 text-center">I am a:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedRole === 'user' ? 'default' : 'outline'}
                    onClick={() => setSelectedRole('user')}
                    className={`h-auto p-4 flex flex-col items-center space-y-3 transition-all duration-200 ${
                      selectedRole === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg' 
                        : 'hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 ${selectedRole === 'user' ? 'text-white' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'user' ? 'text-white' : 'text-gray-700'}`}>
                      Job Seeker
                    </span>
                  </Button>
                  <Button
                    variant={selectedRole === 'interviewer' ? 'default' : 'outline'}
                    onClick={() => setSelectedRole('interviewer')}
                    className={`h-auto p-4 flex flex-col items-center space-y-3 transition-all duration-200 ${
                      selectedRole === 'interviewer' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg' 
                        : 'hover:bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    <Users className={`w-5 h-5 ${selectedRole === 'interviewer' ? 'text-white' : 'text-purple-600'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'interviewer' ? 'text-white' : 'text-gray-700'}`}>
                      Interviewer
                    </span>
                  </Button>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm h-12 text-base font-medium transition-all duration-200 hover:shadow-md"
                size="lg"
              >
                <Chrome className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Signing in as: <span className="font-medium text-gray-700">
                  {selectedRole === 'interviewer' ? 'Interviewer' : 'Job Seeker'}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Secure authentication powered by Google
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Logo and Features */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="max-w-lg w-full text-center">
          {/* Animated Logo Section */}
          <div className="mb-12">
            <div className="relative">
              {/* Main Logo Container */}
              <div className="w-32 h-32 mx-auto mb-8 relative">
                {/* Outer Ring Animation */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-spin" 
                     style={{ animationDuration: '3s' }}></div>
                
                {/* Middle Ring */}
                <div className="absolute inset-2 rounded-full border-2 border-purple-200 animate-spin" 
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
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Application
                </span>
              </h1>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Assistant
                </span>
              </h2>
              
              {/* Animated Subtitle */}
              <p className="text-lg text-gray-600 mb-8 animate-fade-in">
                Your AI-powered career companion for job applications and interviews
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={feature.text}
                  className={`bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm transition-all duration-500 hover:shadow-md hover:bg-white/80 ${
                    animationPhase === index ? 'transform scale-105 shadow-lg' : ''
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{feature.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}