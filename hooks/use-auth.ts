"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setLoading(false)
          router.push("/")
          return
        }

        setUser(session.user)
        setLoading(false)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!session?.user) {
            setUser(null)
            router.push("/")
            return
          }
          setUser(session.user)
        })

        return () => {
          subscription?.unsubscribe()
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        setLoading(false)
        router.push("/")
      }
    }

    checkAuth()
  }, [router])

  const logout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      router.push("/")
    }
  }

  return { user, loading, logout }
}
