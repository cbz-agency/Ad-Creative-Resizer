"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Download, Sparkles, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

type AdFormat = {
  id: string
  name: string
  width: number
  height: number
}

const AD_FORMATS: AdFormat[] = [
  { id: "fb-ig-square", name: "FB/IG Square", width: 1080, height: 1080 },
  { id: "ig-story", name: "IG Story/TikTok", width: 1080, height: 1920 },
  { id: "linkedin-banner", name: "LinkedIn Banner", width: 1200, height: 628 },
]

type ResizedImage = {
  format: AdFormat
  dataUrl: string
}

export default function AdCreativeResizer() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setResizedImages([])
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setResizedImages([])
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const toggleFormat = useCallback((formatId: string) => {
    setSelectedFormats((prev) => (prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId]))
  }, [])

  const resizeImage = (img: HTMLImageElement, targetWidth: number, targetHeight: number): string => {
    const canvas = document.createElement("canvas")
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext("2d")!

    const imgAspect = img.width / img.height
    const targetAspect = targetWidth / targetHeight

    let drawWidth, drawHeight, offsetX, offsetY

    if (imgAspect > targetAspect) {
      drawHeight = targetHeight
      drawWidth = img.width * (targetHeight / img.height)
      offsetX = (targetWidth - drawWidth) / 2
      offsetY = 0
    } else {
      drawWidth = targetWidth
      drawHeight = img.height * (targetWidth / img.width)
      offsetX = 0
      offsetY = (targetHeight - drawHeight) / 2
    }

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, targetWidth, targetHeight)
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    return canvas.toDataURL("image/png")
  }

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || selectedFormats.length === 0) return

    setIsGenerating(true)

    const img = new Image()
    img.src = uploadedImage

    img.onload = () => {
      const resized: ResizedImage[] = []

      selectedFormats.forEach((formatId) => {
        const format = AD_FORMATS.find((f) => f.id === formatId)
        if (format) {
          const dataUrl = resizeImage(img, format.width, format.height)
          resized.push({ format, dataUrl })
        }
      })

      setTimeout(() => {
        setResizedImages(resized)
        setIsGenerating(false)
      }, 800)
    }
  }, [uploadedImage, selectedFormats])

  const handleDownload = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    link.click()
  }, [])

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[oklch(0.65_0.25_330)] via-[oklch(0.6_0.22_300)] to-[oklch(0.55_0.2_270)] bg-clip-text text-transparent drop-shadow-lg">
            Ad Creative Resizer
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Transform your images into perfect ad formats instantly
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card overflow-hidden rounded-2xl">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ${
                isDragging
                  ? "border-[oklch(0.65_0.25_330)] bg-[oklch(0.65_0.25_330)]/10 neon-glow"
                  : "border-border hover:border-[oklch(0.65_0.25_330)]/50"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={{
                    scale: isDragging ? 1.1 : 1,
                    rotate: isDragging ? 5 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {uploadedImage ? (
                    <ImageIcon className="w-16 h-16 text-[oklch(0.65_0.25_330)] mb-4 drop-shadow-lg" />
                  ) : (
                    <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                  )}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {uploadedImage ? "Image Uploaded!" : "Drop your image here"}
                </h3>
                <p className="text-muted-foreground mb-4">or click to browse your files</p>
                {uploadedImage && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-4">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded preview"
                      className="max-w-xs max-h-48 rounded-2xl shadow-2xl ring-2 ring-[oklch(1_0_0)]/30"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Format Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-card-foreground">Select Ad Formats</h2>
            <div className="space-y-4">
              {AD_FORMATS.map((format, index) => (
                <motion.div
                  key={format.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-[oklch(0.65_0.25_330)]/10 hover:to-[oklch(0.6_0.22_300)]/10 transition-all duration-300"
                >
                  <Checkbox
                    id={format.id}
                    checked={selectedFormats.includes(format.id)}
                    onCheckedChange={() => toggleFormat(format.id)}
                    className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[oklch(0.65_0.25_330)] data-[state=checked]:to-[oklch(0.6_0.22_300)] data-[state=checked]:border-[oklch(0.65_0.25_330)]"
                  />
                  <label htmlFor={format.id} className="flex-1 cursor-pointer text-card-foreground font-medium">
                    {format.name}
                    <span className="text-muted-foreground text-sm ml-2">
                      ({format.width}×{format.height})
                    </span>
                  </label>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 flex justify-center"
        >
          <Button
            onClick={handleGenerate}
            disabled={!uploadedImage || selectedFormats.length === 0 || isGenerating}
            size="lg"
            className="glossy-button text-lg px-12 py-6 text-white hover:scale-105 transition-all duration-300 neon-glow disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </motion.div>

        {/* Preview Grid */}
        <AnimatePresence>
          {resizedImages.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}>
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-[oklch(0.65_0.25_330)] via-[oklch(0.6_0.22_300)] to-[oklch(0.55_0.2_270)] bg-clip-text text-transparent">
                Your Resized Ads
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resizedImages.map((item, index) => (
                  <motion.div
                    key={item.format.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card overflow-hidden neon-glow rounded-2xl">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-2 text-card-foreground">{item.format.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {item.format.width} × {item.format.height}
                        </p>
                        <div className="bg-muted/30 rounded-xl p-2 mb-4 ring-1 ring-[oklch(1_0_0)]/20">
                          <img
                            src={item.dataUrl || "/placeholder.svg"}
                            alt={item.format.name}
                            className="w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                        <Button
                          onClick={() => handleDownload(item.dataUrl, `ad-${item.format.id}.png`)}
                          className="w-full bg-gradient-to-r from-[oklch(0.65_0.25_330)] to-[oklch(0.6_0.22_300)] hover:opacity-90 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
