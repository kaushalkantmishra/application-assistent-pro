"use client"

import { useEffect, useState } from "react"

export function useRole() {
  const [role, setRole] = useState<'user' | 'interviewer' | 'admin' | 'job_seeker'>('user')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('selectedRole') as any
      if (savedRole) {
        setRole(savedRole)
      }
    }
  }, [])

  return role
}