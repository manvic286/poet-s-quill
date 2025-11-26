"use client"

import { useState } from "react"
import type { Poem } from "@/hooks/use-poems"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2, Share2 } from "lucide-react"

interface PoemCardProps {
  poem: Poem
  onEdit: (poem: Poem) => void
  onDelete: (id: string) => Promise<void>
  onShare: (poem: Poem) => void
  isDeleting?: boolean
  view?: "grid" | "list"
}

export default function PoemCard({
  poem,
  onEdit,
  onDelete,
  onShare,
  isDeleting = false,
  view = "grid",
}: PoemCardProps) {
  const truncatedContent = poem.content.split("\n").slice(0, 3).join("\n")
  const isContentTruncated = poem.content.split("\n").length > 3

  const formattedDate = new Date(poem.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  if (view === "list") {
    return (
      <div className="group border border-border rounded-lg p-2 bg-card hover:bg-card/80 transition-colors">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base md:text-lg">{poem.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 hidden md:block">{poem.content}</p>
            <p className="text-xs text-muted-foreground mt-2">{formattedDate}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 w-auto justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => onEdit(poem)} title="Edit">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onShare(poem)} title="Share">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(poem.id)}
              disabled={isDeleting}
              className="hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-foreground line-clamp-2 text-base md:text-lg">{poem.title}</h3>
        <p className="text-sm text-muted-foreground mt-3 flex-1 line-clamp-4">
          {truncatedContent}
          {isContentTruncated && "..."}
        </p>
        <p className="text-xs text-muted-foreground mt-4">{formattedDate}</p>
      </div>

      <div className="border-t border-border p-3 flex gap-2 bg-background opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={() => onEdit(poem)} className="flex-1">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onShare(poem)} className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(poem.id)}
          disabled={isDeleting}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
