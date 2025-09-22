"use client"

import { useEffect, useState } from "react"

export function useRole() {
  const [role, setRole] = useState<'user' | 'interviewer'>('user')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('selectedRole') as 'user' | 'interviewer'
      if (savedRole) {
        setRole(savedRole)
      }
    }
  }, [])

  return role
}