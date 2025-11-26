"use client"

import { useState, useRef, useEffect } from "react"
import type { Poem } from "@/hooks/use-poems"
import { Button } from "@/components/ui/button"
import { Download, X, Upload } from "lucide-react"
import PoemPreview from "./poem-preview"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

interface PoemShareModalProps {
  poem: Poem
  onClose: () => void
}

const PRESET_BACKGROUNDS = [
  { id: "white", name: "White", type: "solid", color: "#FFFFFF", textColor: "#1e293b" },
  { id: "dark", name: "Dark", type: "solid", color: "#0f172a", textColor: "#FFFFFF" },
  { id: "blue", name: "Ocean Blue", type: "gradient", gradient: "linear-gradient(135deg, #60a5fa, #2563eb)", textColor: "#FFFFFF" },
  { id: "purple", name: "Sunset", type: "gradient", gradient: "linear-gradient(135deg, #c084fc, #ec4899)", textColor: "#FFFFFF" },
  { id: "green", name: "Forest", type: "gradient", gradient: "linear-gradient(135deg, #34d399, #14b8a6)", textColor: "#FFFFFF" },
  { id: "warm", name: "Warm Gold", type: "gradient", gradient: "linear-gradient(135deg, #fcd34d, #f59e0b)", textColor: "#1e293b" },
]

const FONTS = [
  { id: "serif", name: "Serif (Classic)", className: "font-serif" },
  { id: "sans", name: "Sans (Modern)", className: "font-sans" },
  { id: "mono", name: "Mono (Tech)", className: "font-mono" },
]

export default function PoemShareModal({ poem, onClose }: PoemShareModalProps) {
  const [selectedPreset, setSelectedPreset] = useState("white")
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [backgroundType, setBackgroundType] = useState<"preset" | "custom" | "solid" | "gradient">("preset")
  const [solidColor, setSolidColor] = useState("#FFFFFF")
  const [gradientStart, setGradientStart] = useState("#60a5fa")
  const [gradientEnd, setGradientEnd] = useState("#2563eb")
  const [textColor, setTextColor] = useState("#1e293b")
  const [selectedFont, setSelectedFont] = useState("serif")
  const [titleSize, setTitleSize] = useState(36)
  const [bodySize, setBodySize] = useState(20)
  const [writerSize, setWriterSize] = useState(14)
  const [writerName, setWriterName] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load html2canvas dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.html2canvas) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
      script.onload = () => setHtml2canvasLoaded(true)
      script.onerror = () => console.error("Failed to load html2canvas")
      document.head.appendChild(script)
    } else if (window.html2canvas) {
      setHtml2canvasLoaded(true)
    }
  }, [])

  // Load writer name from user profile
  useEffect(() => {
    const loadWriterName = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single()
          if (profile?.username) {
            setWriterName(profile.username)
          }
        }
      } catch (error) {
        console.error("Failed to load writer name:", error)
      }
    }
    loadWriterName()
  }, [])

  const currentFont = FONTS.find((f) => f.id === selectedFont)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string)
        setBackgroundType("custom")
      }
      reader.readAsDataURL(file)
    }
  }

  const getBackgroundStyle = () => {
    if (backgroundType === "custom" && customImage) {
      return {
        backgroundImage: `url(${customImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    } else if (backgroundType === "solid") {
      return { backgroundColor: solidColor }
    } else if (backgroundType === "gradient") {
      return { background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }
    } else {
      const preset = PRESET_BACKGROUNDS.find((bg) => bg.id === selectedPreset)
      if (preset?.type === "gradient") {
        return { background: preset.gradient }
      }
      return { backgroundColor: preset?.color || "#FFFFFF" }
    }
  }

  const handleExportImage = async () => {
    if (!previewRef.current || !html2canvasLoaded || !window.html2canvas) {
      alert("Please wait for the export tool to load.")
      return
    }

    setIsExporting(true)
    try {
      const canvas = await window.html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-background rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Share Your Poem</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 rounded-lg overflow-hidden border border-border">
              <div
                ref={previewRef}
                className={`${currentFont?.className} w-full min-h-[400px] h-auto flex flex-col items-center justify-center p-8 text-center`}
                style={{ ...getBackgroundStyle(), color: textColor }}
              >
                <h1 className="font-bold mb-6 line-clamp-3 leading-relaxed p-1" style={{ fontSize: `${titleSize}px` }}>
                  {poem.title}
                </h1>
                <div className="leading-relaxed mb-6" style={{ fontSize: `${bodySize}px` }}>
                  {poem.content.split("\n").map((line, i) => (
                    <p key={i} className="mb-2">
                      {line}
                    </p>
                  ))}
                </div>
                {writerName && (
                  <p className="mt-auto opacity-75" style={{ fontSize: `${writerSize}px` }}>
                    ~ {writerName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Writer Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Writer Name</label>
              <Input
                type="text"
                value={writerName}
                onChange={(e) => setWriterName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Background Type Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Background Type</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={backgroundType === "preset" ? "default" : "outline"}
                  onClick={() => setBackgroundType("preset")}
                >
                  Preset
                </Button>
                <Button
                  size="sm"
                  variant={backgroundType === "custom" ? "default" : "outline"}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Custom Image
                </Button>
                <Button
                  size="sm"
                  variant={backgroundType === "solid" ? "default" : "outline"}
                  onClick={() => setBackgroundType("solid")}
                >
                  Solid Color
                </Button>
                <Button
                  size="sm"
                  variant={backgroundType === "gradient" ? "default" : "outline"}
                  onClick={() => setBackgroundType("gradient")}
                >
                  Gradient
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Preset Backgrounds */}
            {backgroundType === "preset" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Preset Backgrounds</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setSelectedPreset(bg.id)
                        setTextColor(bg.textColor)
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${selectedPreset === bg.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div
                        className="w-full h-12 rounded mb-2"
                        style={bg.type === "gradient" ? { background: bg.gradient } : { backgroundColor: bg.color }}
                      />
                      <span className="text-xs font-medium text-foreground text-center block">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Solid Color Picker */}
            {backgroundType === "solid" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Background Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {/* Gradient Color Pickers */}
            {backgroundType === "gradient" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Gradient Start Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Gradient End Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Text Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 h-10 rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1"
                />
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
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedFont === font.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <span className={`${font.className} text-sm font-medium`}>{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Sizes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title Size: {titleSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  value={titleSize}
                  onChange={(e) => setTitleSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Body Size: {bodySize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="36"
                  value={bodySize}
                  onChange={(e) => setBodySize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Writer Name Size: {writerSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={writerSize}
                  onChange={(e) => setWriterSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Export button */}
            <Button
              onClick={handleExportImage}
              disabled={isExporting || !html2canvasLoaded}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : !html2canvasLoaded ? "Loading..." : "Export as Image"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Type declaration for html2canvas
declare global {
  interface Window {
    html2canvas: any
  }
}