"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { DummyUser } from "@/lib/auth"

// import { SessionProvider } from "next-auth/react"

interface AuthContextType {
  user: DummyUser | null
  login: (role?: 'user' | 'interviewer') => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DummyUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('dummyUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (role: 'user' | 'interviewer' = 'user') => {
    const dummyUser: DummyUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role
    }
    setUser(dummyUser)
    localStorage.setItem('dummyUser', JSON.stringify(dummyUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dummyUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
  // return <SessionProvider>{children}</SessionProvider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
