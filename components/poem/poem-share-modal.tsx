"use client"

import { useState, useRef } from "react"
import type { Poem } from "@/hooks/use-poems"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import PoemPreview from "./poem-preview"
import { getSupabaseClient } from "@/lib/supabase/client"

interface PoemShareModalProps {
  poem: Poem
  onClose: () => void
}

const BACKGROUNDS = [
  { id: "white", name: "White", gradient: "bg-white" },
  { id: "dark", name: "Dark", gradient: "bg-slate-900" },
  { id: "blue", name: "Ocean Blue", gradient: "bg-gradient-to-br from-blue-400 to-blue-600" },
  { id: "purple", name: "Sunset", gradient: "bg-gradient-to-br from-purple-400 to-pink-600" },
  { id: "green", name: "Forest", gradient: "bg-gradient-to-br from-emerald-400 to-teal-600" },
  { id: "warm", name: "Warm Gold", gradient: "bg-gradient-to-br from-amber-300 to-orange-500" },
]

const FONTS = [
  { id: "serif", name: "Serif (Classic)", className: "font-serif" },
  { id: "sans", name: "Sans (Modern)", className: "font-sans" },
  { id: "mono", name: "Mono (Tech)", className: "font-mono" },
]

export default function PoemShareModal({ poem, onClose }: PoemShareModalProps) {
  const [selectedBackground, setSelectedBackground] = useState("white")
  const [selectedFont, setSelectedFont] = useState("serif")
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const currentBackground = BACKGROUNDS.find((bg) => bg.id === selectedBackground)
  const currentFont = FONTS.find((f) => f.id === selectedFont)

  const handleExportImage = async () => {
    if (!previewRef.current) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      })

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `${poem.title.replace(/\s+/g, "-").toLowerCase()}.png`
      link.click()

      // Record the share in database
      const supabase = getSupabaseClient()
      await supabase.from("poem_shares").insert({
        poem_id: poem.id,
      })
    } catch (error) {
      console.error("Failed to export image:", error)
      alert("Failed to export image. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Share Your Poem</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 rounded-lg overflow-hidden border border-border">
              <PoemPreview ref={previewRef} poem={poem} backgroundId={selectedBackground} fontId={selectedFont} />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Background selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Background</label>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBackground === bg.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-full h-12 rounded ${bg.gradient} mb-2`} />
                    <span className="text-xs font-medium text-foreground text-center block">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Font Style</label>
              <div className="space-y-2">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedFont === font.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className={`${font.className} text-sm font-medium`}>{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export button */}
            <Button onClick={handleExportImage} disabled={isExporting} className="w-full gap-2" size="lg">
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export as Image"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Dynamic import for html2canvas to reduce bundle size
declare const html2canvas: any

if (typeof window !== "undefined") {
  import("html2canvas").catch(() => {
    console.warn("html2canvas failed to load")
  })
}
