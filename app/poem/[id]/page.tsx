"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePoems, type Poem } from "@/hooks/use-poems"
import RichTextEditor from "@/components/poem/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Share2, Check } from "lucide-react"
import PoemShareModal from "@/components/poem/poem-share-modal"

export default function PoemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { poems, updatePoem, loading } = usePoems()
  const [poem, setPoem] = useState<Poem | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Find poem from context
  useEffect(() => {
    if (!loading && params.id) {
      const foundPoem = poems.find((p) => p.id === params.id)
      if (foundPoem) {
        setPoem(foundPoem)
        setTitle(foundPoem.title)
        setContent(foundPoem.content)
      } else {
        router.push("/dashboard")
      }
    }
  }, [loading, params.id, poems, router])

  const handleSave = useCallback(async () => {
    if (!poem) return

    setIsSaving(true)
    try {
      await updatePoem(poem.id, title || "Untitled", content)
      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save poem:", error)
    } finally {
      setIsSaving(false)
    }
  }, [poem, title, content, updatePoem])

  // Debounced autosave when content changes
  useEffect(() => {
    if (!poem) return

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Set new timeout for autosave (1 second after user stops typing)
    const timeout = setTimeout(() => {
      handleSave()
    }, 1000)

    setSaveTimeout(timeout)

    // Cleanup
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [title, content]) // Note: handleSave and poem intentionally not in deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Poem not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto flex-1"
                placeholder="Untitled Poem"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSaving ? (
                <span className="text-sm text-muted-foreground">Saving...</span>
              ) : lastSaved ? (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="hidden sm:inline">Saved {lastSaved.toLocaleTimeString()}</span>
                </span>
              ) : null}
              <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <RichTextEditor
          initialContent={content}
          onChange={setContent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </main>

      {showShareModal && (
        <PoemShareModal poem={{ ...poem, title, content }} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}
