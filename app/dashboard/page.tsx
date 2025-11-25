"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePoems, type Poem } from "@/hooks/use-poems"
import PoemCard from "@/components/poem/poem-card"
import PoemEditor from "@/components/poem/poem-editor"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Grid2x2, List, ChevronDown, Plus, LogOut } from "lucide-react"
import PoemShareModal from "@/components/poem/poem-share-modal"
import { Input } from "@/components/ui/input"

type ViewMode = "grid" | "list"
type SortBy = "newest" | "oldest" | "title-asc" | "title-desc"

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const { poems, loading: poemsLoading, createPoem, updatePoem, deletePoem } = usePoems()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sharePoem, setSharePoem] = useState<Poem | null>(null)

  const loading = authLoading || poemsLoading

  const filteredAndSortedPoems = useMemo(() => {
    const result = poems.filter(
      (poem) =>
        poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poem.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "newest":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    return result
  }, [poems, searchQuery, sortBy])

  const handleCreatePoem = async (title: string, content: string) => {
    setIsSaving(true)
    try {
      await createPoem(title, content)
      setIsCreating(false)
    } catch (error) {
      console.error("[v0] Failed to create poem:", error)
      alert(error instanceof Error ? error.message : "Failed to create poem")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePoem = async (title: string, content: string) => {
    if (!editingPoem) return
    setIsSaving(true)
    try {
      await updatePoem(editingPoem.id, title, content)
      setEditingPoem(null)
    } catch (error) {
      console.error("[v0] Failed to update poem:", error)
      alert(error instanceof Error ? error.message : "Failed to update poem")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePoem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this poem?")) return
    setDeletingId(id)
    try {
      await deletePoem(id)
    } catch (error) {
      console.error("[v0] Failed to delete poem:", error)
      alert(error instanceof Error ? error.message : "Failed to delete poem")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Poet's Quill</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modal for editing */}
        {editingPoem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-foreground mb-4">Edit Poem</h2>
              <PoemEditor
                initialTitle={editingPoem.title}
                initialContent={editingPoem.content}
                onSave={handleUpdatePoem}
                onCancel={() => setEditingPoem(null)}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}

        {/* Modal for creating */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-foreground mb-4">New Poem</h2>
              <PoemEditor onSave={handleCreatePoem} onCancel={() => setIsCreating(false)} isSaving={isSaving} />
            </div>
          </div>
        )}

        {/* Share modal */}
        {sharePoem && <PoemShareModal poem={sharePoem} onClose={() => setSharePoem(null)} />}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search poems by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Poem</span>
            </Button>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Sort
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSortBy("newest")}
                  className={sortBy === "newest" ? "bg-accent" : ""}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("oldest")}
                  className={sortBy === "oldest" ? "bg-accent" : ""}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("title-asc")}
                  className={sortBy === "title-asc" ? "bg-accent" : ""}
                >
                  Title A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("title-desc")}
                  className={sortBy === "title-desc" ? "bg-accent" : ""}
                >
                  Title Z-A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View mode toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid2x2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Poems display */}
        {filteredAndSortedPoems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {poems.length === 0
                ? "No poems yet. Create your first poem to get started!"
                : "No poems match your search."}
            </p>
            {poems.length === 0 && <Button onClick={() => setIsCreating(true)}>Create First Poem</Button>}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {filteredAndSortedPoems.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={poem}
                onEdit={setEditingPoem}
                onDelete={handleDeletePoem}
                onShare={setSharePoem}
                isDeleting={deletingId === poem.id}
                view={viewMode}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
