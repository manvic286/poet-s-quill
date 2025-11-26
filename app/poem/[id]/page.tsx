"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePoems, type Poem } from "@/hooks/use-poems"
import RichTextEditor from "@/components/poem/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Share2, Save } from "lucide-react"
import PoemShareModal from "@/components/poem/poem-share-modal"
import Link from "next/link"

export default function PoemDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { poems, updatePoem, loading } = usePoems()
    const [poem, setPoem] = useState<Poem | null>(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)

    // Find poem from context
    useEffect(() => {
        if (!loading && params.id) {
            const foundPoem = poems.find((p) => p.id === params.id)
            if (foundPoem) {
                setPoem(foundPoem)
                setTitle(foundPoem.title)
                setContent(foundPoem.content)
            } else {
                // Redirect if not found (or handle 404)
                // router.push("/dashboard")
            }
        }
    }, [loading, params.id, poems, router])

    const handleSave = useCallback(async () => {
        if (!poem) return

        setIsSaving(true)
        try {
            await updatePoem(poem.id, title, content)
        } catch (error) {
            console.error("Failed to save poem:", error)
        } finally {
            setIsSaving(false)
        }
    }, [poem, title, content, updatePoem])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!poem) {
        return <div className="min-h-screen flex items-center justify-center">Poem not found</div>
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg font-bold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                            placeholder="Untitled Poem"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
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
                <PoemShareModal
                    poem={{ ...poem, title, content }} // Pass current state for preview
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    )
}
