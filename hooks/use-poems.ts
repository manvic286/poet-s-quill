"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export interface Poem {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export function usePoems() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPoems = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("poems")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        setError(fetchError.message || "Failed to fetch poems")
        setLoading(false)
        return
      }

      setPoems(data || [])
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPoems()
  }, [])

  const createPoem = async (title: string, content: string) => {
    const supabase = getSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const errorMsg = "No user found"
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    const { data, error: insertError } = await supabase
      .from("poems")
      .insert({
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single()

    if (insertError) {
      const errorMsg = insertError.message || "Failed to create poem"
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setPoems([data, ...poems])
    return data
  }

  const updatePoem = async (id: string, title: string, content: string) => {
    const supabase = getSupabaseClient()

    const { data, error: updateError } = await supabase
      .from("poems")
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      const errorMsg = updateError.message || "Failed to update poem"
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setPoems(poems.map((p) => (p.id === id ? data : p)))
    return data
  }

  const deletePoem = async (id: string) => {
    const supabase = getSupabaseClient()

    const { error: deleteError } = await supabase.from("poems").delete().eq("id", id)

    if (deleteError) {
      const errorMsg = deleteError.message || "Failed to delete poem"
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setPoems(poems.filter((p) => p.id !== id))
  }

  return {
    poems,
    loading,
    error,
    fetchPoems,
    createPoem,
    updatePoem,
    deletePoem,
  }
}
