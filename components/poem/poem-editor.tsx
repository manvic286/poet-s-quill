"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PoemEditorProps {
  initialTitle?: string
  initialContent?: string
  onSave: (title: string, content: string) => Promise<void>
  onCancel: () => void
  isSaving?: boolean
}

export default function PoemEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  onCancel,
  isSaving = false,
}: PoemEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter both a title and content")
      return
    }
    await onSave(title, content)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter poem title"
          disabled={isSaving}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Poem Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your poem here..."
          disabled={isSaving}
          className="w-full mt-1 p-3 min-h-80 md:min-h-96 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Poem"}
        </Button>
      </div>
    </div>
  )
}
