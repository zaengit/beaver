
import { useState } from "react"

import { Check, FileIcon, Film, Music, FileText } from "lucide-react"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaItem {
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

interface MediaGridProps {
  items: MediaItem[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onItemClick: (item: MediaItem) => void
  selectionMode?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MediaGrid({
  items,
  selectedIds,
  onSelect,
  onItemClick,
  selectionMode = false,
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-dashed p-12 text-center">
        <FileIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No media files found.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id)
        return (
          <MediaGridItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            selectionMode={selectionMode}
            onSelect={() => onSelect(item.id)}
            onClick={() => onItemClick(item)}
          />
        )
      })}
    </div>
  )
}

// ─── Grid Item ───────────────────────────────────────────────────────────────

function MediaGridItem({
  item,
  isSelected,
  selectionMode,
  onSelect,
  onClick,
}: {
  item: MediaItem
  isSelected: boolean
  selectionMode: boolean
  onSelect: () => void
  onClick: () => void
}) {
  const [imageError, setImageError] = useState(false)
  const isImage = item.mimeType.startsWith("image/")

  function handleClick(e: React.MouseEvent) {
    if (selectionMode) {
      e.preventDefault()
      onSelect()
    } else {
      onClick()
    }
  }

  function handleCheckboxClick(e: React.MouseEvent) {
    e.stopPropagation()
    onSelect()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick(e as unknown as React.MouseEvent)
        }
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border transition-all cursor-pointer",
        "hover:ring-2 hover:ring-primary/50",
        isSelected && "ring-2 ring-primary"
      )}
      aria-label={`Media: ${item.name}`}
      aria-selected={isSelected}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted">
        {isImage && !imageError ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.alt || item.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MediaTypeIcon mimeType={item.mimeType} />
          </div>
        )}

        {/* Selection checkbox */}
        <div
          className={cn(
            "absolute top-1.5 left-1.5 z-10",
            !selectionMode && "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-sm border-2 transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/80 bg-white/60 hover:border-primary"
            )}
            aria-label={isSelected ? "Deselect" : "Select"}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-1.5">
        <p className="truncate text-xs font-medium">{item.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {formatFileSize(item.size)}
          {item.width && item.height && ` · ${item.width}×${item.height}`}
        </p>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MediaTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("video/")) {
    return <Film className="h-8 w-8 text-muted-foreground/60" />
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-8 w-8 text-muted-foreground/60" />
  }
  if (mimeType === "application/pdf") {
    return <FileText className="h-8 w-8 text-muted-foreground/60" />
  }
  return <FileIcon className="h-8 w-8 text-muted-foreground/60" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
