import { useState } from "react"
import type { Poem } from "@/hooks/use-poems"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2, Share2, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

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
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const plainTextContent = stripHtml(poem.content)
  const truncatedContent = plainTextContent.split("\n").slice(0, 3).join("\n")
  const isContentTruncated = plainTextContent.split("\n").length > 3

  const formattedDate = new Date(poem.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const ActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/poem/${poem.id}`} className="flex items-center cursor-pointer">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare(poem)}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(poem.id)}
          disabled={isDeleting}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (view === "list") {
    return (
      <div className="group border border-border rounded-lg p-4 bg-card hover:bg-card/80 transition-colors">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base md:text-lg">{poem.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 hidden md:block">{plainTextContent}</p>
            <p className="text-xs text-muted-foreground mt-2">{formattedDate}</p>
          </div>
          <div className="flex-shrink-0">
            <ActionsMenu />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow relative">
      <div className="absolute top-4 right-2 z-10">
        <ActionsMenu />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-foreground line-clamp-2 text-base md:text-lg pr-10">{poem.title}</h3>
        <p className="text-sm text-muted-foreground mt-3 flex-1 line-clamp-4">
          {truncatedContent}
          {isContentTruncated && "..."}
        </p>
        <p className="text-xs text-muted-foreground mt-4">{formattedDate}</p>
      </div>
    </Card>
  )
}
