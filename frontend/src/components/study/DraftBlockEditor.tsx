"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"

interface Block {
  id: string
  type: "text" | "image" | "audio" | "video" | "quote"
  content: any
  position: number
}

interface DraftBlockEditorProps {
  block: Block
  onChange: (content: any) => void
}

export function DraftBlockEditor({ block, onChange }: DraftBlockEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    // For now, create a local URL. In production, you'd upload to a server
    const url = URL.createObjectURL(file)
    
    if (block.type === "image") {
      onChange({ url, caption: "" })
    } else if (block.type === "audio") {
      onChange({ url, title: file.name })
    } else if (block.type === "video") {
      onChange({ url, caption: "" })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  if (block.type === "text") {
    // Handle both string content and object content with text property
    const textContent = typeof block.content === 'string' 
      ? block.content 
      : (block.content?.text || "")
    
    return (
      <textarea
        value={textContent}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write..."
        className="w-full min-h-[120px] px-4 py-3 text-lg font-serif leading-relaxed text-foreground bg-card border border-border rounded-lg outline-none resize-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-ring focus:border-primary transition-all"
      />
    )
  }

  if (block.type === "quote") {
    return (
      <div className="border-l-4 border-primary/40 bg-card rounded-r-lg p-6">
        <textarea
          value={block.content?.text || ""}
          onChange={(e) => onChange({ ...block.content, text: e.target.value })}
          placeholder="Quote..."
          className="w-full min-h-[80px] px-0 py-2 text-lg font-serif italic leading-relaxed text-foreground bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40"
        />
        <input
          type="text"
          value={block.content?.source || ""}
          onChange={(e) => onChange({ ...block.content, source: e.target.value })}
          placeholder="— Source (optional)"
          className="w-full mt-3 px-0 py-1 text-sm text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
        />
      </div>
    )
  }

  if (block.type === "image") {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {!block.content?.url ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer transition-all ${
              isDragging
                ? "bg-primary/10 border-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Upload className={`h-12 w-12 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative group">
            <img
              src={block.content.url}
              alt={block.content.caption || ""}
              className="w-full h-auto"
            />
            <button
              onClick={() => onChange({ url: "", caption: "" })}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-4">
              <input
                type="text"
                value={block.content.caption || ""}
                onChange={(e) => onChange({ ...block.content, caption: e.target.value })}
                placeholder="Add a caption..."
                className="w-full px-3 py-2 text-sm text-foreground bg-background border border-input rounded-lg outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (block.type === "audio") {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {!block.content?.url ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer transition-all ${
              isDragging
                ? "bg-primary/10 border-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Upload className={`h-12 w-12 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop audio here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, OGG up to 20MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="p-4">
            <audio controls className="w-full mb-3">
              <source src={block.content.url} />
              Your browser does not support the audio element.
            </audio>
            <button
              onClick={() => onChange({ url: "", title: "" })}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Remove audio
            </button>
          </div>
        )}
      </div>
    )
  }

  if (block.type === "video") {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {!block.content?.url ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer transition-all ${
              isDragging
                ? "bg-primary/10 border-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Upload className={`h-12 w-12 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragging ? "Drop video here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, WebM up to 50MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative group">
            <video controls className="w-full">
              <source src={block.content.url} />
              Your browser does not support the video element.
            </video>
            <button
              onClick={() => onChange({ url: "", caption: "" })}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-4">
              <input
                type="text"
                value={block.content.caption || ""}
                onChange={(e) => onChange({ ...block.content, caption: e.target.value })}
                placeholder="Add a caption..."
                className="w-full px-3 py-2 text-sm text-foreground bg-background border border-input rounded-lg outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
