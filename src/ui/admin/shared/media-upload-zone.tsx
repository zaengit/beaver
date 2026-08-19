
import { useState, useRef, useCallback } from "react"
import { Upload, FileIcon, X, Loader2 } from "lucide-react"
import { Button } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { adminToast } from "@zaenpm/beaver/ui/admin/shared/admin-toast"
import { cn } from "@zaenpm/beaver/pkg/utils/ui"

interface UploadedMedia {
  id: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  alt: string | null
  caption: string | null
  width: number | null
  height: number | null
  folder: string | null
  createdAt: number
  updatedAt: number
}

interface MediaUploadZoneProps {
  onUploadComplete?: (media: UploadedMedia) => void
  onUploadError?: (error: string) => void
  accept?: string
  className?: string
  compact?: boolean
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  error?: string
}

export function MediaUploadZone({
  onUploadComplete,
  onUploadError,
  accept,
  className,
  compact = false,
}: MediaUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const uploadId = Math.random().toString(36).slice(2)
      setUploading((prev) => [...prev, { id: uploadId, file, progress: 0 }])

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!result.success) {
          const errorMsg = result.message || "Upload failed"
          setUploading((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, error: errorMsg } : u
            )
          )
          onUploadError?.(errorMsg)
          adminToast.error(errorMsg)
          return null
        }

        setUploading((prev) => prev.filter((u) => u.id !== uploadId))
        onUploadComplete?.(result.data)
        adminToast.uploaded(file.name)
        return result.data as UploadedMedia
      } catch {
        const errorMsg = "Upload failed. Please try again."
        setUploading((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, error: errorMsg } : u
          )
        )
        onUploadError?.(errorMsg)
        adminToast.error(errorMsg)
        return null
      }
    },
    [onUploadComplete, onUploadError]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      for (const file of files) {
        if (accept && !matchesMimeFilter(file.type, accept)) continue
        await uploadFile(file)
      }
    },
    [accept, uploadFile]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      for (const file of files) {
        await uploadFile(file)
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [uploadFile]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeUploadError = useCallback((id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label="Upload media files"
        className={cn(
          "relative cursor-pointer rounded-sm border-2 border-dashed transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragOver && "border-primary bg-primary/5",
          compact ? "p-4" : "p-8",
          "flex flex-col items-center justify-center gap-2 text-center"
        )}
      >
        <Upload
          className={cn(
            "text-muted-foreground",
            compact ? "h-5 w-5" : "h-8 w-8"
          )}
        />
        {!compact && (
          <>
            <p className="text-sm font-medium">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max 10MB per file. Supported: images, PDF, video, audio.
            </p>
          </>
        )}
        {compact && (
          <p className="text-xs text-muted-foreground">
            Drop files or click to upload
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      {/* Upload progress / errors */}
      {uploading.length > 0 && (
        <div className="space-y-1">
          {uploading.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2 rounded-sm border px-3 py-2 text-sm",
                item.error
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-border"
              )}
            >
              {item.error ? (
                <FileIcon className="h-4 w-4 text-destructive" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <span className="flex-1 truncate">
                {item.file.name}
                {item.error && (
                  <span className="ml-2 text-destructive">{item.error}</span>
                )}
              </span>
              {item.error && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeUploadError(item.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesMimeFilter(mimeType: string, filter: string): boolean {
  if (!filter) return true
  const filters = filter.split(",").map((f) => f.trim())
  return filters.some((f) => {
    if (f.endsWith("/*")) {
      const prefix = f.replace("/*", "/")
      return mimeType.startsWith(prefix)
    }
    return mimeType === f
  })
}
