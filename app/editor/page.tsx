"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import RichTextEditor from "@/components/poem/rich-text-editor"

export default function PoemEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const poemId = searchParams.get("id")

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(poemId)

  // Load existing poem if editing
  useEffect(() => {
    const loadPoem = async () => {
      if (!poemId || authLoading || !user) {
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("poems")
          .select("*")
          .eq("id", poemId)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Failed to load poem:", error)
          alert("Failed to load poem")
          router.push("/dashboard")
          return
        }

        setTitle(data.title)
        setContent(data.content)
        setCurrentPoemId(data.id)
      } catch (error) {
        console.error("Error loading poem:", error)
        alert("An error occurred while loading the poem")
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadPoem()
    }
  }, [poemId, authLoading, user, router])

  // Autosave function
  const savePoem = useCallback(async () => {
    if ((!title.trim() && !content.trim()) || !user) return

    setSaving(true)
    try {
      const supabase = getSupabaseClient()

      if (currentPoemId) {
        // Update existing poem
        const { error } = await supabase
          .from("poems")
          .update({
            title: title || "Untitled",
            content: content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentPoemId)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // Create new poem
        const { data, error } = await supabase
          .from("poems")
          .insert({
            user_id: user.id,
            title: title || "Untitled",
            content: content,
          })
          .select()
          .single()

        if (error) throw error

        // Update URL and state to include the new poem ID
        if (data) {
          setCurrentPoemId(data.id)
          window.history.replaceState(null, "", `/editor?id=${data.id}`)
        }
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save poem:", error)
    } finally {
      setSaving(false)
    }
  }, [currentPoemId, title, content, user])

  // Debounced autosave when content changes
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Only autosave if there's content
    if (!title.trim() && !content.trim()) return

    // Set new timeout for autosave (1 second after user stops typing)
    const timeout = setTimeout(() => {
      savePoem()
    }, 1000)

    setSaveTimeout(timeout)

    // Cleanup
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [title, content, savePoem])

  const handleBack = () => {
    router.push("/dashboard")
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Poem"
                className="text-lg font-bold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto flex-1"
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {saving ? (
                <span className="text-sm text-muted-foreground">Saving...</span>
              ) : lastSaved ? (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <RichTextEditor
          initialContent={content}
          onChange={setContent}
          onSave={savePoem}
          isSaving={saving}
        />
      </main>
    </div>
  )
}