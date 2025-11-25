"use client"

import { forwardRef } from "react"
import type { Poem } from "@/hooks/use-poems"

interface PoemPreviewProps {
  poem: Poem
  backgroundId: string
  fontId: string
}

const BACKGROUNDS: Record<string, { gradient: string; textColor: string }> = {
  white: { gradient: "bg-white", textColor: "text-slate-900" },
  dark: { gradient: "bg-slate-900", textColor: "text-white" },
  blue: { gradient: "bg-gradient-to-br from-blue-400 to-blue-600", textColor: "text-white" },
  purple: { gradient: "bg-gradient-to-br from-purple-400 to-pink-600", textColor: "text-white" },
  green: { gradient: "bg-gradient-to-br from-emerald-400 to-teal-600", textColor: "text-white" },
  warm: { gradient: "bg-gradient-to-br from-amber-300 to-orange-500", textColor: "text-slate-900" },
}

const FONTS: Record<string, string> = {
  serif: "font-serif",
  sans: "font-sans",
  mono: "font-mono",
}

export default forwardRef<HTMLDivElement, PoemPreviewProps>(function PoemPreview({ poem, backgroundId, fontId }, ref) {
  const bgConfig = BACKGROUNDS[backgroundId] || BACKGROUNDS.white
  const fontClass = FONTS[fontId] || FONTS.serif

  return (
    <div
      ref={ref}
      className={`${bgConfig.gradient} ${bgConfig.textColor} ${fontClass} w-full aspect-square flex flex-col items-center justify-center p-8 text-center`}
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-6 line-clamp-3">{poem.title}</h1>
      <div className="text-lg md:text-xl leading-relaxed max-h-64 overflow-hidden mb-6">
        {poem.content.split("\n").map((line, i) => (
          <p key={i} className="mb-2">
            {line}
          </p>
        ))}
      </div>
      <p className="text-sm mt-auto opacity-75">~ Poet's Quill</p>
    </div>
  )
})
