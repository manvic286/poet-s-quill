"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

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
    const savePoem = useCallback(async (titleToSave: string, contentToSave: string) => {
        if (!titleToSave.trim() || !contentToSave.trim() || !user) return

        setSaving(true)
        try {
            const supabase = getSupabaseClient()

            if (poemId) {
                // Update existing poem
                const { error } = await supabase
                    .from("poems")
                    .update({
                        title: titleToSave,
                        content: contentToSave,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", poemId)
                    .eq("user_id", user.id)

                if (error) throw error
            } else {
                // Create new poem
                const { data, error } = await supabase
                    .from("poems")
                    .insert({
                        user_id: user.id,
                        title: titleToSave,
                        content: contentToSave,
                    })
                    .select()
                    .single()

                if (error) throw error

                // Update URL to include the new poem ID without reloading
                if (data) {
                    window.history.replaceState(null, "", `/editor?id=${data.id}`)
                }
            }

            setLastSaved(new Date())
        } catch (error) {
            console.error("Failed to save poem:", error)
        } finally {
            setSaving(false)
        }
    }, [poemId, user])

    // Debounced autosave when content changes
    useEffect(() => {
        if (!title.trim() && !content.trim()) return

        // Clear existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout)
        }

        // Set new timeout for autosave (1 second after user stops typing)
        const timeout = setTimeout(() => {
            savePoem(title, content)
        }, 1000)

        setSaveTimeout(timeout)

        // Cleanup
        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [title, content]) // Note: savePoem is intentionally not in deps to avoid infinite loop

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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            {saving ? (
                                <span className="text-sm text-muted-foreground">Saving...</span>
                            ) : lastSaved ? (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </header>

            {/* Editor */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    <div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Poem title..."
                            className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0 h-auto py-2"
                            autoFocus
                        />
                    </div>

                    <div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your poem here..."
                            className="w-full min-h-[calc(100vh-250px)] p-0 border-none bg-transparent text-foreground placeholder-muted-foreground focus:outline-none resize-none text-lg leading-relaxed"
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}